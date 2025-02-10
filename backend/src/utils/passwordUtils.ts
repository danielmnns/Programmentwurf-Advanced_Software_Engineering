import bcrypt from "bcryptjs"; 

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  console.log("Generated Salt:", salt);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hashed Password:", hashedPassword);
  return hashedPassword;
};

export const comparePasswords = async (inputPassword: string, storedHash: string): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, storedHash);
};