import * as bcrypt from 'bcrypt';

describe('Password Hashing', () => {
  it('should hash and compare password correctly', async () => {
    const password = 'password123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    expect(hashedPassword).not.toEqual(password);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
