const request = require('supertest');
const sequelize = require('../config/database'); 
const app = require('../index');
require('dotenv').config({ path: '.env.test' });


describe('POST /api/shorten', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  it('should generate a short string', async () => {
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

  it('should return 404 if short string is not found', async () => {
    const response = await request(app).get('/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Short URL not found');
  });
});