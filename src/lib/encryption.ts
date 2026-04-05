const hash = async (text: string): Promise<string> => {
  return Bun.password.hash(text, 'argon2id');
};

const verify = async (text: string, hashedText: string): Promise<boolean> => {
  return Bun.password.verify(text, hashedText);
};

export { hash, verify };
