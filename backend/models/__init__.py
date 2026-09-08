from .base import *
from .deep_vetting import *
from .dossier import *
from .investigation import *
from .scout import *
from .outreach import *
from .chat import *

import inspect
from pydantic import BaseModel

for name, obj in list(locals().items()):
    if inspect.isclass(obj) and issubclass(obj, BaseModel):
        try:
            obj.model_rebuild()
        except Exception:
            pass
