const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE: Add a new blog
router.post('/', protect, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required.'
            });
        }

        const blog = await Blog.create({
            title,
            content,
            author: req.user._id
        });

        res.status(201).json({
            message: 'Blog created successfully.',
            blog
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create blog.',
            error: error.message
        });
    }
});

// READ: Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch blogs.',
            error: error.message
        });
    }
});

// READ: Get a single blog
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid blog ID.'
            });
        }

        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name email');

        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found.'
            });
        }

        res.json(blog);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch blog.',
            error: error.message
        });
    }
});

// UPDATE: Edit your own blog; admin can edit any blog
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid blog ID.'
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found.'
            });
        }

        const isOwner =
            blog.author.toString() === req.user._id.toString();

        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: 'You can only edit your own blogs.'
            });
        }

        const { title, content } = req.body;

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    message: 'Title cannot be empty.'
                });
            }
            blog.title = title.trim();
        }

        if (content !== undefined) {
            if (typeof content !== 'string' || !content.trim()) {
                return res.status(400).json({
                    message: 'Content cannot be empty.'
                });
            }
            blog.content = content;
        }

        await blog.save();

        res.json({
            message: 'Blog updated successfully.',
            blog
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to update blog.',
            error: error.message
        });
    }
});

// DELETE: Delete your own blog; admin can delete any blog
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid blog ID.'
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found.'
            });
        }

        const isOwner =
            blog.author.toString() === req.user._id.toString();

        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: 'You can only delete your own blogs.'
            });
        }

        await blog.deleteOne();

        res.json({
            message: 'Blog deleted successfully.'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete blog.',
            error: error.message
        });
    }
});

// Example of a route restricted to administrators
router.get('/admin/check', protect, adminOnly, (req, res) => {
    res.json({
        message: 'Welcome, administrator!'
    });
});

module.exports = router;