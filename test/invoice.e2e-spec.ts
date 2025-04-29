import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module'; // Replace with the actual path to your AppModule
import mongoose from 'mongoose';

describe('InvoiceController (e2e)', () => {
  let app: INestApplication;
  let createdInvoiceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import your main application module
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    jest.setTimeout(15000); // Increase timeout to 15 seconds
    // await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    mongoose.connection.close(true)
    mongoose.connection.removeAllListeners(); // Remove lingering event listeners
    await app.close();
  });

  afterEach(async () => {
    // Clear collections after each test to ensure isolation
    const collections = mongoose.connection.collections;
    for (const collectionName in collections) {
      const collection = collections[collectionName];
      await collection.deleteMany({});
    }
  });

  describe('POST /invoices', () => {
    it('should create a new invoice', async () => {
      const createInvoiceDto = {
        customer: 'John Doe',
        amount: 1500.75,
        reference: 'INV-2025-001',
        items: [
          {
            sku: 'ITEM-001',
            qt: 2,
          },
        ],
        date: '2025-04-29T08:54:42.918Z',
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createInvoiceDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          customer: 'John Doe',
          amount: 1500.75,
          reference: 'INV-2025-001',
          items: [
            {
              sku: 'ITEM-001',
              qt: 2,
            },
          ],
          date: '2025-04-29T08:54:42.918Z',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(String),
        }),
      );

      // Store created invoice ID for other tests
      createdInvoiceId = response.body.id;
    });
  });

  it('should return a list of invoices with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/invoices')
      .query({ page: 1, limit: 10 })
      .expect(200);
  
    // Validate the structure of the actual response
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body).toHaveProperty('limit', '10'); // Ensure the limit is correct
    expect(response.body).toHaveProperty('page', '1'); // Ensure the page is correct
    expect(response.body).toHaveProperty('total'); // Ensure total is present
    expect(typeof response.body.total).toBe('number'); // Ensure total is a number
  });

  describe('GET /invoices/:id', () => {
    it('should return a single invoice by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/invoices/${createdInvoiceId}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          customer: 'John Doe',
          amount: 1500.75,
          reference: 'INV-2025-001',
          items: [
            {
              sku: 'ITEM-001',
              qt: 2,
            },
          ],
          date: '2025-04-29T08:54:42.918Z',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: createdInvoiceId,
        }),
      );
    });

    it('should return 404 if invoice not found', async () => {
      const fakeId = '681093d241849825fce810c9'; // Non-existent ID
      await request(app.getHttpServer()).get(`/invoices/${fakeId}`).expect(404);
    });
  });
});
