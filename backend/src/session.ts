type Session = {
    messages: { role: "user" | "assistant"; content: string }[];
    lastCode?: string;
}

const sessions = new Map<string, Session>();

export function getSession(id:string):Session{
 if (!sessions.has(id)) {
    sessions.set(id, { messages: [] });
  }
  return sessions.get(id);
}