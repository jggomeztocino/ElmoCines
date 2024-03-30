'use strict';

const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();
const mongoUrl = process.env.MONGODB_KEY;
const dbName = process.env.DATABASE_NAME;
const client = new MongoClient(mongoUrl);

router.use(express.json());

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const users = await db.collection('users').find({}).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).send('Error al obtener los usuarios: ' + error.message);
    } finally {
        await client.close();
    }
});

// Obtener un usuario por su correo
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await client.connect();
        const db = client.db(dbName);
        const user = await db.collection('users').findOne({ _id: userId });
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener el usuario: ' + error.message);
    } finally {
        await client.close();
    }
});

// Añadir un usuario
router.post('/', async (req, res) => {
    try {
        const newUser = req.body;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('users').insertOne(newUser);
        res.status(201).send('Usuario añadido correctamente');
    } catch (error) {
        res.status(500).send('Error al añadir el usuario: ' + error.message);
    } finally {
        await client.close();
    }
});

// Actualizar un usuario por su correo
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('users').updateOne({ _id: userId }, { $set: updateData });
        if (result.matchedCount === 0) {
            res.status(404).send('Usuario no encontrado');
        } else {
            res.send('Usuario actualizado correctamente');
        }
    } catch (error) {
        res.status(500).send('Error al actualizar el usuario: ' + error.message);
    } finally {
        await client.close();
    }
});

// Eliminar un usuario por su correo
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await client.connect();
        const db = client.db(dbName);
        const result = await db.collection('users').deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            res.status(404).send('Usuario no encontrado');
        } else {
            res.send('Usuario eliminado correctamente');
        }
    } catch (error) {
        res.status(500).send('Error al eliminar el usuario: ' + error.message);
    } finally {
        await client.close();
    }
});

module.exports = router;
