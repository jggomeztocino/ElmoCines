'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const router = express.Router();
const mongoUrl = process.env.MONGODB_KEY;
const dbName = process.env.DATABASE_NAME;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

const client = new MongoClient(mongoUrl);

// Obtener todas las sesiones de una película
router.get('/:movieId', async (req, res) => {
    try {
        await client.connect();
        const sessions = await client.db(dbName).collection(`${req.params.movieId}-sesiones`).find({}).toArray();
        res.json(sessions);
    } catch (error) {
        res.status(500).send(`Error al obtener las sesiones: ${error.message}`);
    } finally {
        await client.close();
    }
});

// Obtener una sesión específica por ID
router.get('/:movieId/:sessionId', async (req, res) => {
    try {
        await client.connect();
        const session = await client.db(dbName).collection(`${req.params.movieId}-sesiones`).findOne({ _id: req.params.sessionId });
        if (session) {
            res.json(session);
        } else {
            res.status(404).send('Sesión no encontrada');
        }
    } catch (error) {
        res.status(500).send(`Error al obtener la sesión: ${error.message}`);
    } finally {
        await client.close();
    }
});

// Crear una nueva sesión
router.post('/:movieId', async (req, res) => {
    try {
        await client.connect();
        const result = await client.db(dbName).collection(`${req.params.movieId}-sesiones`).insertOne(req.body);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        res.status(500).send(`Error al crear la sesión: ${error.message}`);
    } finally {
        await client.close();
    }
});

// Actualizar una sesión
router.put('/:movieId/:sessionId', async (req, res) => {
    try {
        await client.connect();
        const result = await client.db(dbName).collection(`${req.params.movieId}-sesiones`).updateOne({ _id: req.params.sessionId }, { $set: req.body });
        if (result.matchedCount === 0) {
            res.status(404).send('Sesión no encontrada');
        } else {
            res.json(result);
        }
    } catch (error) {
        res.status(500).send(`Error al actualizar la sesión: ${error.message}`);
    } finally {
        await client.close();
    }
});

// Eliminar una sesión
router.delete('/:movieId/:sessionId', async (req, res) => {
    try {
        await client.connect();
        const result = await client.db(dbName).collection(`${req.params.movieId}-sesiones`).deleteOne({ _id: req.params.sessionId });
        if (result.deletedCount === 0) {
            res.status(404).send('Sesión no encontrada');
        } else {
            res.status(204).send();
        }
    } catch (error) {
        res.status(500).send(`Error al eliminar la sesión: ${error.message}`);
    } finally {
        await client.close();
    }
});

module.exports = router;
