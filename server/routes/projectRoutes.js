const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  updateProjectProgress,
  rateProjectFreelancer,
  rateProjectClient,
  rejectProjectFreelancer,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getProjects)
  .post(protect, authorize('client', 'admin'), createProject);

router.get('/myprojects', protect, authorize('client', 'admin'), getMyProjects);

router.put('/:id/progress', protect, authorize('freelancer', 'admin'), updateProjectProgress);
router.post('/:id/rate', protect, authorize('client', 'admin'), rateProjectFreelancer);
router.post('/:id/rate-client', protect, authorize('freelancer', 'admin'), rateProjectClient);
router.post('/:id/reject', protect, authorize('client', 'admin'), rejectProjectFreelancer);

router
  .route('/:id')
  .get(getProjectById)
  .put(protect, authorize('client', 'admin'), updateProject)
  .delete(protect, authorize('client', 'admin'), deleteProject);

module.exports = router;
