/**
 * TESTS DE RATING DE PELÍCULAS
 * 
 * Este archivo contiene tests para la funcionalidad de rating.
 * Usamos MOCKS de Prisma para no tocar la base de datos real durante los tests.
 * 
 * Herramientas:
 * - Jest: Framework de testing
 * - Supertest: Para hacer peticiones HTTP a la API
 * - Mocks: Impostores de Prisma y del middleware de auth
 */

const request = require('supertest');

// ============================================
// CONFIGURACIÓN DE MOCKS
// ============================================

// Mock del módulo prisma ANTES de importar el servidor
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  movie: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('../lib/prisma', () => mockPrisma);

// Mock del middleware de autenticación
// Simula que el usuario está autenticado con userId 'user-123'
jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'user-123' };
    next();
  };
});

const app = require('../server');
const prisma = require('../lib/prisma');

// ============================================
// SUITE DE TESTS: RATING DE PELÍCULAS
// ============================================
describe('API de Rating de Películas', () => {
  // Limpiar todos los mocks después de cada test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // TESTS DE ACTUALIZAR RATING
  // ==========================================
  describe('PATCH /api/movies/:id/rating', () => {
    
    it('debería actualizar el rating a un valor válido (0)', async () => {
      // ARRANGE
      const movieMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 0,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMovieMock = {
        ...movieMock,
        rating: 0,
        updatedAt: new Date(),
      };

      prisma.movie.findFirst.mockResolvedValue(movieMock);
      prisma.movie.update.mockResolvedValue(updatedMovieMock);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 0 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(0);
      expect(prisma.movie.findFirst).toHaveBeenCalledWith({
        where: { id: 'movie-1', ownerId: 'user-123' },
      });
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 'movie-1' },
        data: { rating: 0 },
      });
    });

    it('debería actualizar el rating a un valor válido (5)', async () => {
      // ARRANGE
      const movieMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 0,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMovieMock = {
        ...movieMock,
        rating: 5,
        updatedAt: new Date(),
      };

      prisma.movie.findFirst.mockResolvedValue(movieMock);
      prisma.movie.update.mockResolvedValue(updatedMovieMock);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 5 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(5);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 'movie-1' },
        data: { rating: 5 },
      });
    });

    it('debería actualizar el rating a valores intermedios (3)', async () => {
      // ARRANGE
      const movieMock = {
        id: 'movie-1',
        title: 'Inception',
        director: 'Christopher Nolan',
        year: 2010,
        posterUrl: 'https://example.com/inception.jpg',
        isFavorite: false,
        rating: 0,
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedMovieMock = {
        ...movieMock,
        rating: 3,
        updatedAt: new Date(),
      };

      prisma.movie.findFirst.mockResolvedValue(movieMock);
      prisma.movie.update.mockResolvedValue(updatedMovieMock);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 3 });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(3);
    });

    it('debería rechazar rating negativo con 400', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue({
        id: 'movie-1',
        rating: 0,
        ownerId: 'user-123',
      });

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: -1 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entre 0 y 5');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería rechazar rating mayor a 5 con 400', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue({
        id: 'movie-1',
        rating: 0,
        ownerId: 'user-123',
      });

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 6 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entre 0 y 5');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería rechazar rating no-numérico (string) con 400', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue({
        id: 'movie-1',
        rating: 0,
        ownerId: 'user-123',
      });

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 'cinco' });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entre 0 y 5');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería rechazar rating decimal con 400 (no es entero)', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue({
        id: 'movie-1',
        rating: 0,
        ownerId: 'user-123',
      });

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-1/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4.5 });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Rating debe ser un número entre 0 y 5');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('debería devolver 404 si la película no existe', async () => {
      // ARRANGE
      prisma.movie.findFirst.mockResolvedValue(null);

      // ACT
      const response = await request(app)
        .patch('/api/movies/movie-no-existe/rating')
        .set('Authorization', 'Bearer fake-token')
        .send({ rating: 4 });

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Película no encontrada');
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });
  });
});

/**
 * NOTAS PARA ESTUDIANTES:
 * 
 * 1. VALIDACIÓN DE ENTEROS:
 *    Usamos Number.isInteger(rating) para asegurar que sea un número entero,
 *    no decimal (4.5 es rechazado).
 * 
 * 2. RANGO VALIDADO:
 *    La validación es ANTES de tocar Prisma, para fallar rápido y seguro.
 * 
 * 3. PATRÓN AAA (ARRANGE-ACT-ASSERT):
 *    - Arrange: Configuramos mocks
 *    - Act: Hacemos la petición HTTP
 *    - Assert: Verificamos respuesta y llamadas a Prisma
 * 
 * 4. CASOS CUBIERTOS:
 *    - Valores válidos: 0, 3, 5
 *    - Fuera de rango: -1, 6
 *    - Tipos inválidos: string, decimal
 *    - Película no existe: 404
 * 
 * 5. SEGURIDAD:
 *    Antes de actualizar, buscamos con findFirst + ownerId
 *    para asegurar que el usuario solo califica SUS películas.
 */
