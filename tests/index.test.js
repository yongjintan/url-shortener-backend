const request = require('supertest');

describe('POST /api/shorten', () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
  
    it('should generate a short URL', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://www.example.com' });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shortUrl');
    });
  
    it('should return 400 if longUrl is missing', async () => {
      const response = await request(app).post('/api/shorten').send({});
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'longUrl is required');
    });
  });
  
  describe('GET /:shortString', () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
  
    it('should redirect to the long URL', async () => {
      const shortUrlResponse = await request(app)
        .post('/api/shorten')
        .send({ longUrl: 'https://www.example.com' });
  
      const shortUrl = shortUrlResponse.body.shortUrl;
      const shortString = shortUrl.split('/').pop();
  
      const response = await request(app).get(`/${shortString}`);
  
      expect(response.status).toBe(302); // 302 is the status code for redirection
      expect(response.header.location).toBe('https://www.example.com');
    });
  
    it('should return 404 if short URL is not found', async () => {
      const response = await request(app).get('/nonexistent');
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Short URL not found');
    });
  });