#!/usr/bin/env python3
"""Automated Pydantic-to-TypeScript Contract Generator.

Inspects canonical Pydantic v2 models and Enums in backend.models and generates
strict, type-safe TypeScript interfaces and companion const arrays in
frontend/src/types/generated/contracts.ts.

Usage:
    python scripts/generate_contracts.py
    python scripts/generate_contracts.py --check
    python scripts/generate_contracts.py --out frontend/src/types/generated/contracts.ts
"""

import argparse
import difflib
import inspect
import os
import re
import sys
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import (
    Any,
    Dict,
    ForwardRef,
    List,
    Literal,
    Optional,
    Set,
    Tuple,
    Union,
    get_args,
    get_origin,
)

# Ensure project root is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Transparently use repository .venv if available and current interpreter is not the venv
VENV_DIR = (REPO_ROOT / ".venv").resolve()
VENV_PYTHON = VENV_DIR / "bin" / "python"
if VENV_PYTHON.exists() and Path(sys.prefix).resolve() != VENV_DIR:
    try:
        import pydantic  # noqa: F401
    except ImportError:
        os.execv(str(VENV_PYTHON), [str(VENV_PYTHON)] + sys.argv)

try:
    from pydantic import BaseModel
    from backend import models
except ImportError as e:
    sys.stderr.write(f"Error importing backend models: {e}\n")
    sys.exit(1)


def sanitize_jsdoc(text: Optional[str], indent: str = "  ") -> str:
    """Format docstring or description as clean JSDoc comment."""
    if not text:
        return ""
    lines = text.strip().splitlines()
    if len(lines) == 1:
        return f"{indent}/** {lines[0].strip()} */\n"
    res = [f"{indent}/**"]
    for line in lines:
        cleaned = line.strip()
        res.append(f"{indent} * {cleaned}" if cleaned else f"{indent} *")
    res.append(f"{indent} */\n")
    return "\n".join(res)


def py_type_to_ts(tp: Any, registered_models: Set[str], registered_enums: Set[str]) -> str:
    """Recursively map Python type annotations to TypeScript types."""
    if isinstance(tp, ForwardRef):
        return tp.__forward_arg__
    if isinstance(tp, str):
        return tp

    origin = get_origin(tp)
    args = get_args(tp)

    # Primitives
    if tp is str:
        return "string"
    if tp in (int, float):
        return "number"
    if tp is bool:
        return "boolean"
    if tp is type(None):
        return "null"
    if tp is Any:
        return "unknown"
    if tp is dict:
        return "Record<string, unknown>"
    if tp is list:
        return "unknown[]"

    # Enums
    if inspect.isclass(tp) and issubclass(tp, Enum):
        return tp.__name__

    # BaseModels
    if inspect.isclass(tp) and issubclass(tp, BaseModel):
        return tp.__name__

    # Generics
    if origin in (list, List):
        inner = py_type_to_ts(args[0], registered_models, registered_enums) if args else "unknown"
        # Wrap union in parentheses if needed
        if " | " in inner and not (inner.startswith("(") and inner.endswith(")")):
            return f"({inner})[]"
        return f"{inner}[]"

    if origin in (dict, Dict):
        val = py_type_to_ts(args[1], registered_models, registered_enums) if len(args) > 1 else "unknown"
        return f"Record<string, {val}>"

    if origin is Union:
        # Filter out NoneType
        non_none = [a for a in args if a is not type(None)]
        if not non_none:
            return "null"
        if len(non_none) == 1:
            return py_type_to_ts(non_none[0], registered_models, registered_enums)
        
        parts = [py_type_to_ts(a, registered_models, registered_enums) for a in non_none]
        # Deduplicate while preserving order
        deduped = []
        for p in parts:
            if p not in deduped:
                deduped.append(p)
        return " | ".join(deduped)

    if origin is Literal:
        parts = [f"'{a}'" if isinstance(a, str) else str(a) for a in args]
        return " | ".join(parts)

    return "unknown"


def is_optional_field(model_cls: type[BaseModel], field_name: str, field: Any) -> bool:
    """Determine if a Pydantic field should be marked optional (?) in TypeScript.

    A field is optional in TypeScript if and only if its type union explicitly
    contains NoneType (e.g. Optional[T] / Union[T, None]).
    """
    args = get_args(field.annotation)
    return type(None) in args


def pluralize_const_name(enum_name: str) -> str:
    """Convert PascalCase enum name to SCREAMING_SNAKE_CASE plural array name."""
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", enum_name)
    snake = re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).upper()
    if snake.endswith("S") or snake.endswith("CH") or snake.endswith("SH"):
        return f"{snake}ES"
    if snake.endswith("Y") and not snake.endswith("AY") and not snake.endswith("EY"):
        return f"{snake[:-1]}IES"
    return f"{snake}S"


def generate_enum_code(enum_cls: type[Enum]) -> str:
    """Generate TypeScript string union type and const array for an Enum."""
    name = enum_cls.__name__
    values = [e.value for e in enum_cls]
    doc = sanitize_jsdoc(enum_cls.__doc__, indent="")

    union_members = "\n".join(f"  | '{val}'" for val in values)
    const_members = ",\n".join(f"  '{val}'" for val in values)
    const_name = pluralize_const_name(name)

    return f"""{doc}export type {name} =
{union_members};

export const {const_name} = [
{const_members},
] as const;
"""


def generate_interface_code(
    model_cls: type[BaseModel], registered_models: Set[str], registered_enums: Set[str]
) -> str:
    """Generate TypeScript interface for a Pydantic BaseModel."""
    name = model_cls.__name__
    doc = sanitize_jsdoc(model_cls.__doc__, indent="")
    lines = [f"{doc}export interface {name} {{"]

    for field_name, field in model_cls.model_fields.items():
        field_doc = sanitize_jsdoc(field.description, indent="  ")
        ts_type = py_type_to_ts(field.annotation, registered_models, registered_enums)
        opt_marker = "?" if is_optional_field(model_cls, field_name, field) else ""
        
        if field_doc:
            lines.append(field_doc.rstrip("\n"))
        lines.append(f"  {field_name}{opt_marker}: {ts_type};")

    lines.append("}\n")
    return "\n".join(lines)


def topological_sort_models(
    model_classes: List[type[BaseModel]],
) -> List[type[BaseModel]]:
    """Sort models topologically so dependencies precede dependents."""
    name_to_cls = {cls.__name__: cls for cls in model_classes}
    deps: Dict[str, Set[str]] = {cls.__name__: set() for cls in model_classes}

    for cls in model_classes:
        for field in cls.model_fields.values():
            field_str = str(field.annotation)
            for other_name in name_to_cls:
                if other_name != cls.__name__ and other_name in field_str:
                    deps[cls.__name__].add(other_name)

    sorted_names: List[str] = []
    visited: Set[str] = set()
    visiting: Set[str] = set()

    def visit(n: str) -> None:
        if n in visiting:
            # Cycle fallback
            return
        if n not in visited:
            visiting.add(n)
            for dep in sorted(deps.get(n, set())):
                if dep in name_to_cls:
                    visit(dep)
            visiting.remove(n)
            visited.add(n)
            sorted_names.append(n)

    for cls_name in sorted(name_to_cls.keys()):
        visit(cls_name)

    return [name_to_cls[n] for n in sorted_names]


def generate_typescript_contracts() -> str:
    """Generate the full TypeScript contract content from backend.models."""
    enums_list: List[Tuple[str, type[Enum]]] = [
        (name, cls)
        for name, cls in inspect.getmembers(models, inspect.isclass)
        if issubclass(cls, Enum) and cls is not Enum
    ]
    enums_list.sort(key=lambda x: x[0])

    models_list: List[type[BaseModel]] = [
        cls
        for name, cls in inspect.getmembers(models, inspect.isclass)
        if issubclass(cls, BaseModel) and cls is not BaseModel
    ]

    sorted_models = topological_sort_models(models_list)

    registered_enums = {name for name, _ in enums_list}
    registered_models = {cls.__name__ for cls in sorted_models}

    out = []
    out.append("/**")
    out.append(" * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY")
    out.append(" *")
    out.append(" * Generated from canonical Pydantic v2 models in backend/models.py")
    out.append(" * Generator: scripts/generate_contracts.py")
    out.append(f" * Timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}")
    out.append(" *")
    out.append(" * To regenerate, run:")
    out.append(" *   npm run generate-contracts  (from frontend/)")
    out.append(" *   or: python scripts/generate_contracts.py  (from project root)")
    out.append(" */\n")

    out.append("// ============================================================================")
    out.append("// 1. ENUMS & CONST ARRAYS")
    out.append("// ============================================================================\n")

    for _, enum_cls in enums_list:
        out.append(generate_enum_code(enum_cls))

    out.append("// ============================================================================")
    out.append("// 2. PYDANTIC DOMAIN INTERFACES")
    out.append("// ============================================================================\n")

    for model_cls in sorted_models:
        out.append(generate_interface_code(model_cls, registered_models, registered_enums))

    out.append("// ============================================================================")
    out.append("// 3. CANONICAL CONVENIENCE ALIASES")
    out.append("// ============================================================================\n")
    out.append("export type Evidence = ClaimEvidence;")
    out.append("export type DossierType = EvidenceDossier;")
    out.append("export type DueDiligenceArgs = DueDiligenceToolArgs;")
    out.append("export type OpportunityScoutArgs = OpportunityScoutToolArgs;")
    out.append("export type CompareFestivalsArgs = CompareFestivalsToolArgs;")
    out.append("export type GrantScoutArgs = GrantScoutToolArgs;")
    out.append("export type InvitationEmailArgs = InvitationEmailToolArgs;\n")

    return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate TypeScript interfaces from backend Pydantic models."
    )
    parser.add_argument(
        "--out",
        type=str,
        default="frontend/src/types/generated/contracts.ts",
        help="Path to output TypeScript contracts file (default: frontend/src/types/generated/contracts.ts)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check whether current TypeScript file is up to date with Pydantic models without modifying it.",
    )
    args = parser.parse_args()

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = REPO_ROOT / out_path

    new_content = generate_typescript_contracts()

    if args.check:
        if not out_path.exists():
            sys.stderr.write(f"Contract file does not exist: {out_path}\n")
            sys.exit(1)
        existing_content = out_path.read_text(encoding="utf-8")

        # Ignore timestamp line when comparing
        normalize = lambda text: re.sub(r"Timestamp: .*", "Timestamp: <IGNORED>", text)
        if normalize(existing_content) != normalize(new_content):
            sys.stderr.write("TypeScript contracts are out of sync with Pydantic models!\n")
            diff = difflib.unified_diff(
                existing_content.splitlines(keepends=True),
                new_content.splitlines(keepends=True),
                fromfile=str(out_path),
                tofile="generated",
            )
            sys.stderr.writelines(diff)
            sys.stderr.write("\nRun 'npm run generate-contracts' to synchronize.\n")
            sys.exit(1)
        print("TypeScript contracts are perfectly synchronized with backend Pydantic models.")
        sys.exit(0)

    # Write output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(new_content, encoding="utf-8")
    print(f"Successfully generated TypeScript contracts -> {out_path}")


if __name__ == "__main__":
    main()
