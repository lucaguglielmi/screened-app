class PiiVault {
  private vault: Record<string, string> = {};
  private counter = 0;

  mask(text: string): string {
    let masked = text;

    // Mask Emails
    masked = masked.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      (match) => {
        const token = `[EMAIL_${this.counter++}]`;
        this.vault[token] = match;
        return token;
      }
    );

    // Mask Phone Numbers (simple heuristic for +44, etc. with min length)
    masked = masked.replace(
      /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g,
      (match) => {
        const digitsOnly = match.replace(/\D/g, '');
        if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
          const token = `[PHONE_${this.counter++}]`;
          this.vault[token] = match;
          return token;
        }
        return match;
      }
    );

    // Mock NER for names to demonstrate the reversible vault (Hackathon scope)
    // In production, this would be a local WASM NER model.
    const mockNames = ['John Doe', 'Sarah Jenkins', 'Marcus Thorne', 'Elena Rostova'];
    for (const name of mockNames) {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      masked = masked.replace(regex, (match) => {
        const token = `[PERSON_${this.counter++}]`;
        this.vault[token] = match;
        return token;
      });
    }

    return masked;
  }

  unmask(text: string): string {
    let unmasked = text;
    for (const [token, value] of Object.entries(this.vault)) {
      unmasked = unmasked.split(token).join(value);
    }
    return unmasked;
  }
}

export const piiVault = new PiiVault();
