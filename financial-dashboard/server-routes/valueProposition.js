/**
 * VALUE PROPOSITION API ROUTES
 * Gestisce CRUD operations per la sezione Value Proposition
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const DB_PATH = path.join(__dirname, '../src/data/database.json');

// Helper: Leggi database
async function readDatabase() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Helper: Scrivi database
async function writeDatabase(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// ============================================
// CUSTOMER PROFILE ROUTES
// ============================================

// PATCH /api/value-proposition/customer-profile/job/:jobId
router.patch('/customer-profile/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let jobFound = false;
    
    for (const segment of segments) {
      const jobIndex = segment.jobs.findIndex(j => j.id === jobId);
      if (jobIndex !== -1) {
        segment.jobs[jobIndex] = { ...segment.jobs[jobIndex], ...updates };
        jobFound = true;
        break;
      }
    }
    
    if (!jobFound) {
      return res.status(404).json({ error: 'Job non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Job aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento job:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/customer-profile/pain/:painId
router.patch('/customer-profile/pain/:painId', async (req, res) => {
  try {
    const { painId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let painFound = false;
    
    for (const segment of segments) {
      const painIndex = segment.pains.findIndex(p => p.id === painId);
      if (painIndex !== -1) {
        segment.pains[painIndex] = { ...segment.pains[painIndex], ...updates };
        painFound = true;
        break;
      }
    }
    
    if (!painFound) {
      return res.status(404).json({ error: 'Pain non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Pain aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento pain:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/customer-profile/gain/:gainId
router.patch('/customer-profile/gain/:gainId', async (req, res) => {
  try {
    const { gainId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let gainFound = false;
    
    for (const segment of segments) {
      const gainIndex = segment.gains.findIndex(g => g.id === gainId);
      if (gainIndex !== -1) {
        segment.gains[gainIndex] = { ...segment.gains[gainIndex], ...updates };
        gainFound = true;
        break;
      }
    }
    
    if (!gainFound) {
      return res.status(404).json({ error: 'Gain non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Gain aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento gain:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VALUE MAP ROUTES
// ============================================

// PATCH /api/value-proposition/value-map/feature/:featureId
router.patch('/value-map/feature/:featureId', async (req, res) => {
  try {
    const { featureId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.valueMap) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const products = db.valueProposition.valueMap.productsAndServices;
    let featureFound = false;
    
    for (const product of products) {
      const featureIndex = product.features.findIndex(f => f.id === featureId);
      if (featureIndex !== -1) {
        product.features[featureIndex] = { ...product.features[featureIndex], ...updates };
        featureFound = true;
        break;
      }
    }
    
    if (!featureFound) {
      return res.status(404).json({ error: 'Feature non trovata' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Feature aggiornata con successo' });
  } catch (error) {
    console.error('Errore aggiornamento feature:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/value-map/pain-reliever/:relieverId
router.patch('/value-map/pain-reliever/:relieverId', async (req, res) => {
  try {
    const { relieverId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.valueMap) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const relieverIndex = db.valueProposition.valueMap.painRelievers.findIndex(pr => pr.id === relieverId);
    if (relieverIndex === -1) {
      return res.status(404).json({ error: 'Pain Reliever non trovato' });
    }
    
    db.valueProposition.valueMap.painRelievers[relieverIndex] = {
      ...db.valueProposition.valueMap.painRelievers[relieverIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Pain Reliever aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento pain reliever:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/value-map/gain-creator/:creatorId
router.patch('/value-map/gain-creator/:creatorId', async (req, res) => {
  try {
    const { creatorId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.valueMap) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const creatorIndex = db.valueProposition.valueMap.gainCreators.findIndex(gc => gc.id === creatorId);
    if (creatorIndex === -1) {
      return res.status(404).json({ error: 'Gain Creator non trovato' });
    }
    
    db.valueProposition.valueMap.gainCreators[creatorIndex] = {
      ...db.valueProposition.valueMap.gainCreators[creatorIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Gain Creator aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento gain creator:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MESSAGING ROUTES
// ============================================

// PATCH /api/value-proposition/messaging/elevator-pitch
router.patch('/messaging/elevator-pitch', async (req, res) => {
  try {
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    db.valueProposition.messaging.elevatorPitch = {
      ...db.valueProposition.messaging.elevatorPitch,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Elevator Pitch aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento elevator pitch:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/messaging/value-statement/:statementId
router.patch('/messaging/value-statement/:statementId', async (req, res) => {
  try {
    const { statementId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const statementIndex = db.valueProposition.messaging.valueStatements.findIndex(vs => vs.id === statementId);
    if (statementIndex === -1) {
      return res.status(404).json({ error: 'Value Statement non trovato' });
    }
    
    db.valueProposition.messaging.valueStatements[statementIndex] = {
      ...db.valueProposition.messaging.valueStatements[statementIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Value Statement aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento value statement:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/messaging/narrative-flow
router.patch('/messaging/narrative-flow', async (req, res) => {
  try {
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    db.valueProposition.messaging.narrativeFlow = {
      ...db.valueProposition.messaging.narrativeFlow,
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Narrative Flow aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento narrative flow:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NEW MESSAGING SECTIONS ROUTES
// ============================================

// PATCH /api/value-proposition/messaging/positioning-statement
router.patch('/messaging/positioning-statement', async (req, res) => {
  try {
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    db.valueProposition.messaging.positioningStatement = {
      ...db.valueProposition.messaging.positioningStatement,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Positioning Statement aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento positioning statement:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/messaging/competitive-message/:messageId
router.patch('/messaging/competitive-message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const messageIndex = db.valueProposition.messaging.competitiveMessages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Competitive Message non trovato' });
    }
    
    db.valueProposition.messaging.competitiveMessages[messageIndex] = {
      ...db.valueProposition.messaging.competitiveMessages[messageIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Competitive Message aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento competitive message:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/value-proposition/messaging/competitive-message
router.post('/messaging/competitive-message', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newMessage = {
      id: `cm_${Date.now()}`,
      competitorId: data.competitorId || 'new-competitor',
      competitorName: data.competitorName || 'New Competitor',
      theirStrength: data.theirStrength || 'Their strength...',
      ourDifferentiator: data.ourDifferentiator || 'Our differentiator...',
      proofPoint: data.proofPoint || 'Proof point...',
      whenToUse: data.whenToUse || 'When to use...',
      visible: true,
    };
    
    if (!db.valueProposition.messaging.competitiveMessages) {
      db.valueProposition.messaging.competitiveMessages = [];
    }
    
    db.valueProposition.messaging.competitiveMessages.push(newMessage);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Errore creazione competitive message:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/messaging/competitive-message/:messageId
router.delete('/messaging/competitive-message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const messageIndex = db.valueProposition.messaging.competitiveMessages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Competitive Message non trovato' });
    }
    
    db.valueProposition.messaging.competitiveMessages.splice(messageIndex, 1);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Competitive Message eliminato' });
  } catch (error) {
    console.error('Errore eliminazione competitive message:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/messaging/testimonial/:testimonialId
router.patch('/messaging/testimonial/:testimonialId', async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const testimonialIndex = db.valueProposition.messaging.customerTestimonials.findIndex(t => t.id === testimonialId);
    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial non trovato' });
    }
    
    db.valueProposition.messaging.customerTestimonials[testimonialIndex] = {
      ...db.valueProposition.messaging.customerTestimonials[testimonialIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Testimonial aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/value-proposition/messaging/testimonial
router.post('/messaging/testimonial', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newTestimonial = {
      id: `test_${Date.now()}`,
      customerName: data.customerName || 'Customer Name',
      role: data.role || 'Role',
      organization: data.organization || 'Organization',
      organizationType: data.organizationType || 'hospital',
      testimonial: data.testimonial || 'Testimonial...',
      impact: data.impact || 'Impact...',
      metrics: data.metrics || '',
      date: data.date || new Date().toISOString(),
      verified: data.verified || false,
      visible: true,
      featured: data.featured || false,
    };
    
    if (!db.valueProposition.messaging.customerTestimonials) {
      db.valueProposition.messaging.customerTestimonials = [];
    }
    
    db.valueProposition.messaging.customerTestimonials.push(newTestimonial);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error('Errore creazione testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/messaging/testimonial/:testimonialId
router.delete('/messaging/testimonial/:testimonialId', async (req, res) => {
  try {
    const { testimonialId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const testimonialIndex = db.valueProposition.messaging.customerTestimonials.findIndex(t => t.id === testimonialId);
    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial non trovato' });
    }
    
    db.valueProposition.messaging.customerTestimonials.splice(testimonialIndex, 1);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Testimonial eliminato' });
  } catch (error) {
    console.error('Errore eliminazione testimonial:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/messaging/objection/:objectionId
router.patch('/messaging/objection/:objectionId', async (req, res) => {
  try {
    const { objectionId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const objectionIndex = db.valueProposition.messaging.objections.findIndex(o => o.id === objectionId);
    if (objectionIndex === -1) {
      return res.status(404).json({ error: 'Objection non trovato' });
    }
    
    db.valueProposition.messaging.objections[objectionIndex] = {
      ...db.valueProposition.messaging.objections[objectionIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Objection aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento objection:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/value-proposition/messaging/objection
router.post('/messaging/objection', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newObjection = {
      id: `obj_${Date.now()}`,
      objection: data.objection || 'Customer objection...',
      category: data.category || 'other',
      frequency: data.frequency || 'occasional',
      response: data.response || 'Response...',
      proofPoints: data.proofPoints || [],
      resourceLinks: data.resourceLinks || [],
      visible: true,
    };
    
    if (!db.valueProposition.messaging.objections) {
      db.valueProposition.messaging.objections = [];
    }
    
    db.valueProposition.messaging.objections.push(newObjection);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, objection: newObjection });
  } catch (error) {
    console.error('Errore creazione objection:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/messaging/objection/:objectionId
router.delete('/messaging/objection/:objectionId', async (req, res) => {
  try {
    const { objectionId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.messaging) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const objectionIndex = db.valueProposition.messaging.objections.findIndex(o => o.id === objectionId);
    if (objectionIndex === -1) {
      return res.status(404).json({ error: 'Objection non trovato' });
    }
    
    db.valueProposition.messaging.objections.splice(objectionIndex, 1);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Objection eliminato' });
  } catch (error) {
    console.error('Errore eliminazione objection:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COMPETITOR ROUTES
// ============================================

// PATCH /api/value-proposition/competitor/:competitorId
router.patch('/competitor/:competitorId', async (req, res) => {
  try {
    const { competitorId } = req.params;
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.competitorAnalysis) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const competitorIndex = db.valueProposition.competitorAnalysis.competitors.findIndex(c => c.id === competitorId);
    if (competitorIndex === -1) {
      return res.status(404).json({ error: 'Competitor non trovato' });
    }
    
    db.valueProposition.competitorAnalysis.competitors[competitorIndex] = {
      ...db.valueProposition.competitorAnalysis.competitors[competitorIndex],
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Competitor aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento competitor:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// METADATA ROUTES
// ============================================

// PATCH /api/value-proposition/metadata
router.patch('/metadata', async (req, res) => {
  try {
    const updates = req.body;
    
    const db = await readDatabase();
    if (!db.valueProposition) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    db.valueProposition.metadata = {
      ...db.valueProposition.metadata,
      ...updates
    };
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Metadata aggiornati con successo' });
  } catch (error) {
    console.error('Errore aggiornamento metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CREATE OPERATIONS (POST)
// ============================================

// POST /api/value-proposition/customer-profile/job
router.post('/customer-profile/job', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newJob = {
      id: `job_${Date.now()}`,
      description: data.description,
      importance: data.importance || 3,
      difficulty: data.difficulty || 3,
      category: data.category || 'functional',
      notes: data.notes || '',
      visible: true,
    };
    
    const activeSegmentId = db.valueProposition.customerProfile.activeSegmentId;
    const segment = db.valueProposition.customerProfile.segments.find(s => s.id === activeSegmentId);
    
    if (!segment) {
      return res.status(404).json({ error: 'Active segment non trovato' });
    }
    
    segment.jobs.push(newJob);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, job: newJob });
  } catch (error) {
    console.error('Errore creazione job:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/value-proposition/customer-profile/pain
router.post('/customer-profile/pain', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newPain = {
      id: `pain_${Date.now()}`,
      description: data.description,
      severity: data.severity || 3,
      frequency: data.frequency || 3,
      category: data.category || 'functional',
      notes: data.notes || '',
      visible: true,
    };
    
    const activeSegmentId = db.valueProposition.customerProfile.activeSegmentId;
    const segment = db.valueProposition.customerProfile.segments.find(s => s.id === activeSegmentId);
    
    if (!segment) {
      return res.status(404).json({ error: 'Active segment non trovato' });
    }
    
    segment.pains.push(newPain);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, pain: newPain });
  } catch (error) {
    console.error('Errore creazione pain:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/value-proposition/customer-profile/gain
router.post('/customer-profile/gain', async (req, res) => {
  try {
    const data = req.body;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const newGain = {
      id: `gain_${Date.now()}`,
      description: data.description,
      desirability: data.desirability || 3,
      impact: data.impact || 3,
      category: data.category || 'functional',
      notes: data.notes || '',
      visible: true,
    };
    
    const activeSegmentId = db.valueProposition.customerProfile.activeSegmentId;
    const segment = db.valueProposition.customerProfile.segments.find(s => s.id === activeSegmentId);
    
    if (!segment) {
      return res.status(404).json({ error: 'Active segment non trovato' });
    }
    
    segment.gains.push(newGain);
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, gain: newGain });
  } catch (error) {
    console.error('Errore creazione gain:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE OPERATIONS
// ============================================

// DELETE /api/value-proposition/customer-profile/job/:jobId
router.delete('/customer-profile/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let jobDeleted = false;
    
    for (const segment of segments) {
      const jobIndex = segment.jobs.findIndex(j => j.id === jobId);
      if (jobIndex !== -1) {
        segment.jobs.splice(jobIndex, 1);
        jobDeleted = true;
        break;
      }
    }
    
    if (!jobDeleted) {
      return res.status(404).json({ error: 'Job non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Job eliminato' });
  } catch (error) {
    console.error('Errore eliminazione job:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/customer-profile/pain/:painId
router.delete('/customer-profile/pain/:painId', async (req, res) => {
  try {
    const { painId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let painDeleted = false;
    
    for (const segment of segments) {
      const painIndex = segment.pains.findIndex(p => p.id === painId);
      if (painIndex !== -1) {
        segment.pains.splice(painIndex, 1);
        painDeleted = true;
        break;
      }
    }
    
    if (!painDeleted) {
      return res.status(404).json({ error: 'Pain non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Pain eliminato' });
  } catch (error) {
    console.error('Errore eliminazione pain:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/customer-profile/gain/:gainId
router.delete('/customer-profile/gain/:gainId', async (req, res) => {
  try {
    const { gainId } = req.params;
    const db = await readDatabase();
    
    if (!db.valueProposition?.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    let gainDeleted = false;
    
    for (const segment of segments) {
      const gainIndex = segment.gains.findIndex(g => g.id === gainId);
      if (gainIndex !== -1) {
        segment.gains.splice(gainIndex, 1);
        gainDeleted = true;
        break;
      }
    }
    
    if (!gainDeleted) {
      return res.status(404).json({ error: 'Gain non trovato' });
    }
    
    db.valueProposition.lastUpdated = new Date().toISOString();
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Gain eliminato' });
  } catch (error) {
    console.error('Errore eliminazione gain:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SEGMENT MANAGEMENT ROUTES
// ============================================

// POST /api/value-proposition/customer-profile/segment
router.post('/customer-profile/segment', async (req, res) => {
  try {
    const { name, priority, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    // Create new segment
    const newSegment = {
      id: `segment_${Date.now()}`,
      name: name.trim(),
      priority: priority || 'medium',
      icon: icon || '🏢',
      jobs: [],
      pains: [],
      gains: [],
      visible: true,
      order: db.valueProposition.customerProfile.segments.length
    };
    
    db.valueProposition.customerProfile.segments.push(newSegment);
    db.valueProposition.lastUpdated = new Date().toISOString();
    
    await writeDatabase(db);
    
    res.json({ success: true, segment: newSegment });
  } catch (error) {
    console.error('Errore creazione segment:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/value-proposition/customer-profile/segment/:segmentId
router.delete('/customer-profile/segment/:segmentId', async (req, res) => {
  try {
    const { segmentId } = req.params;
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segments = db.valueProposition.customerProfile.segments;
    
    // Don't allow deleting the last segment
    if (segments.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last segment' });
    }
    
    const segmentIndex = segments.findIndex(s => s.id === segmentId);
    if (segmentIndex === -1) {
      return res.status(404).json({ error: 'Segment non trovato' });
    }
    
    // If deleting active segment, set first segment as active
    if (db.valueProposition.customerProfile.activeSegmentId === segmentId) {
      db.valueProposition.customerProfile.activeSegmentId = segments[0].id === segmentId 
        ? segments[1].id 
        : segments[0].id;
    }
    
    segments.splice(segmentIndex, 1);
    db.valueProposition.lastUpdated = new Date().toISOString();
    
    await writeDatabase(db);
    
    res.json({ success: true, message: 'Segment eliminato' });
  } catch (error) {
    console.error('Errore eliminazione segment:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/value-proposition/customer-profile/active-segment
router.patch('/customer-profile/active-segment', async (req, res) => {
  try {
    const { segmentId } = req.body;
    
    if (!segmentId) {
      return res.status(400).json({ error: 'segmentId is required' });
    }
    
    const db = await readDatabase();
    if (!db.valueProposition || !db.valueProposition.customerProfile) {
      return res.status(404).json({ error: 'Value Proposition non trovata' });
    }
    
    const segmentExists = db.valueProposition.customerProfile.segments.some(s => s.id === segmentId);
    if (!segmentExists) {
      return res.status(404).json({ error: 'Segment non trovato' });
    }
    
    db.valueProposition.customerProfile.activeSegmentId = segmentId;
    db.valueProposition.lastUpdated = new Date().toISOString();
    
    await writeDatabase(db);
    
    res.json({ success: true, activeSegmentId: segmentId });
  } catch (error) {
    console.error('Errore set active segment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
