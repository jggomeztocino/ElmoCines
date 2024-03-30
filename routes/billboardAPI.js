'use strict';

const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();
const mongoUrl = process.env.MONGODB_KEY;
const dbName = process.env.DATABASE_NAME;
const client = new MongoClient(mongoUrl);

// Middleware para convertir el cuerpo de las solicitudes a JSON
router.use(express.json());

// Obtener todas las películas
router.get('/', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const movies = await db.collection('movies').find({}).toArray();
        res.json(movies);
    } catch (error) {
        res.status(500).send('Error al obtener las películas: ' + error.message);
    } finally {
        await client.close();
    }
});

// Obtener una película por su ID
router.get('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        await client.connect();
        const db = client.db(dbName);
        const movie = await db.collection('movies').findOne({ _id: movieId });
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).send('Película no encontrada');
        }
    } catch (error) {
        res.status(500).send('Error al obtener la película: ' + error.message);
    } finally {
        await client.close();
    }
});

// Añadir una película
router.post('/', async (req, res) => {
    try {
        const newMovie = req.body;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('movies').insertOne(newMovie);
        res.status(201).send('Película añadida correctamente');
    } catch (error) {
        res.status(500).send('Error al añadir la película: ' + error.message);
    } finally {
        await client.close();
    }
});

// Actualizar una película por su ID
router.put('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const updateData = req.body;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('movies').updateOne({ _id: movieId }, { $set: updateData });
        if (result.matchedCount === 0) {
            res.status(404).send('Película no encontrada');
        } else {
            res.send('Película actualizada correctamente');
        }
    } catch (error) {
        res.status(500).send('Error al actualizar la película: ' + error.message);
    } finally {
        await client.close();
    }
});

// Eliminar una película por su ID
router.delete('/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('movies').deleteOne({ _id: movieId });
        if (result.deletedCount === 0) {
            res.status(404).send('Película no encontrada');
        } else {
            res.send('Película eliminada correctamente');
        }
    } catch (error) {
        res.status(500).send('Error al eliminar la película: ' + error.message);
    } finally {
        await client.close();
    }
});

module.exports = router;
