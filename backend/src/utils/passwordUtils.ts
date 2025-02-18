import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePasswords = async (inputPassword: string, storedHash: string): Promise<boolean> => {
  try {
    const result = await bcrypt.compare(inputPassword, storedHash);
    return result;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false; 
  }
};