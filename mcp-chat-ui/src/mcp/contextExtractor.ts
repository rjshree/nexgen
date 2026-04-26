export function extractProjectName(message: string): string | undefined {
    const match = message.match(/project\s+([a-zA-Z0-9-_]+)/i);
    return match?.[1];
  }