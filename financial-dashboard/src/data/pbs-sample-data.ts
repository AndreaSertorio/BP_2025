// PBS Sample Data for Eco 3D Medical Device
import type { PBSNode } from '@/types/team';

export const pbsSampleData: PBSNode[] = [
  // Level 0: Final Product
  {
    pbs_id: 'PBS-0',
    parent_id: null,
    nome: 'Eco 3D - Dispositivo Ultrasuoni 3D',
    descrizione: 'Dispositivo medico Classe IIa per ecografia 3D real-time con AI/ML segmentazione automatica',
    owner_obs_id: 'CEO'
  },

  // Level 1: Main Subsystems
  {
    pbs_id: 'PBS-1',
    parent_id: 'PBS-0',
    nome: 'Hardware Subsystem',
    descrizione: 'Componenti hardware: sonda, elettronica, housing',
    owner_obs_id: 'CTO'
  },
  {
    pbs_id: 'PBS-2',
    parent_id: 'PBS-0',
    nome: 'Software Subsystem',
    descrizione: 'Firmware + Applicazione AI/ML',
    owner_obs_id: 'CTO'
  },
  {
    pbs_id: 'PBS-3',
    parent_id: 'PBS-0',
    nome: 'Regulatory & Documentation',
    descrizione: 'Dossier tecnico, manuali, certificazioni',
    owner_obs_id: 'COO'
  },
  {
    pbs_id: 'PBS-4',
    parent_id: 'PBS-0',
    nome: 'Packaging & Accessories',
    descrizione: 'Imballaggio, cavi, gel, manuale utente',
    owner_obs_id: 'COO'
  },

  // Level 2: Hardware Components
  {
    pbs_id: 'PBS-1.1',
    parent_id: 'PBS-1',
    nome: 'Sonda Ultrasuoni',
    descrizione: 'Trasduttore 64 canali multi-frequenza (2-15 MHz)',
    owner_obs_id: 'HW Engineer'
  },
  {
    pbs_id: 'PBS-1.1.1',
    parent_id: 'PBS-1.1',
    nome: 'Trasduttore Piezoelettrico',
    descrizione: 'Array 64 elementi PZT, multi-frequenza 2-15 MHz'
  },
  {
    pbs_id: 'PBS-1.1.2',
    parent_id: 'PBS-1.1',
    nome: 'Lenti Acustiche',
    descrizione: 'Focusing lens per beam steering 3D'
  },
  {
    pbs_id: 'PBS-1.1.3',
    parent_id: 'PBS-1.1',
    nome: 'Cavo Sonda',
    descrizione: 'Cavo schermato 64ch + alimentazione, 2m lunghezza'
  },
  
  {
    pbs_id: 'PBS-1.2',
    parent_id: 'PBS-1',
    nome: 'Elettronica Acquisizione',
    descrizione: 'PCB con ADC, beamforming, processing',
    owner_obs_id: 'HW Engineer'
  },
  {
    pbs_id: 'PBS-1.2.1',
    parent_id: 'PBS-1.2',
    nome: 'PCB Main Board',
    descrizione: 'PCB 8 layer, componenti SMD, connettori'
  },
  {
    pbs_id: 'PBS-1.2.2',
    parent_id: 'PBS-1.2',
    nome: 'ADC 64-Channel',
    descrizione: 'Analog-to-Digital Converter 64ch, 40 MSPS'
  },
  {
    pbs_id: 'PBS-1.2.3',
    parent_id: 'PBS-1.2',
    nome: 'FPGA Beamforming',
    descrizione: 'FPGA per real-time beamforming 3D'
  },
  {
    pbs_id: 'PBS-1.2.4',
    parent_id: 'PBS-1.2',
    nome: 'Power Supply Unit',
    descrizione: 'PSU medical-grade isolato, 12V/5V DC'
  },
  {
    pbs_id: 'PBS-1.2.5',
    parent_id: 'PBS-1.2',
    nome: 'Microcontroller',
    descrizione: 'MCU ARM Cortex-M7 per control logic'
  },

  {
    pbs_id: 'PBS-1.3',
    parent_id: 'PBS-1',
    nome: 'Housing Meccanico',
    descrizione: 'Case medical-grade, ergonomico',
    owner_obs_id: 'HW Engineer'
  },
  {
    pbs_id: 'PBS-1.3.1',
    parent_id: 'PBS-1.3',
    nome: 'Case Esterno',
    descrizione: 'Plastica medical-grade (ABS/PC), IP42 rated'
  },
  {
    pbs_id: 'PBS-1.3.2',
    parent_id: 'PBS-1.3',
    nome: 'Handle Ergonomico',
    descrizione: 'Impugnatura ergonomica per medici, silicone medical-grade'
  },
  {
    pbs_id: 'PBS-1.3.3',
    parent_id: 'PBS-1.3',
    nome: 'Display Touchscreen',
    descrizione: 'Display 7" touchscreen capacitivo, 800x480'
  },

  // Level 2: Software Components
  {
    pbs_id: 'PBS-2.1',
    parent_id: 'PBS-2',
    nome: 'Firmware Embedded',
    descrizione: 'Firmware real-time per controllo hardware',
    owner_obs_id: 'CTO'
  },
  {
    pbs_id: 'PBS-2.1.1',
    parent_id: 'PBS-2.1',
    nome: 'Driver ADC/FPGA',
    descrizione: 'Driver low-level per ADC e FPGA'
  },
  {
    pbs_id: 'PBS-2.1.2',
    parent_id: 'PBS-2.1',
    nome: 'DAQ Module',
    descrizione: 'Data Acquisition Module, buffer management'
  },
  {
    pbs_id: 'PBS-2.1.3',
    parent_id: 'PBS-2.1',
    nome: 'Control Interface',
    descrizione: 'USB/Ethernet interface per comunicazione PC/App'
  },

  {
    pbs_id: 'PBS-2.2',
    parent_id: 'PBS-2',
    nome: 'Applicazione Software',
    descrizione: 'App desktop/mobile per visualizzazione e processing',
    owner_obs_id: 'AI Engineer'
  },
  {
    pbs_id: 'PBS-2.2.1',
    parent_id: 'PBS-2.2',
    nome: '3D Reconstruction Engine',
    descrizione: 'Algoritmo ricostruzione volumetrica 3D real-time'
  },
  {
    pbs_id: 'PBS-2.2.2',
    parent_id: 'PBS-2.2',
    nome: 'AI/ML Segmentation Module',
    descrizione: 'Segmentazione automatica organi con deep learning (U-Net)'
  },
  {
    pbs_id: 'PBS-2.2.3',
    parent_id: 'PBS-2.2',
    nome: 'Visualization UI',
    descrizione: 'GUI 2D/3D viewer, measurement tools, export DICOM'
  },
  {
    pbs_id: 'PBS-2.2.4',
    parent_id: 'PBS-2.2',
    nome: 'Cloud Sync Module',
    descrizione: 'Sincronizzazione cloud per archivio immagini'
  },

  // Level 2: Regulatory & Documentation
  {
    pbs_id: 'PBS-3.1',
    parent_id: 'PBS-3',
    nome: 'Dossier Tecnico MDR',
    descrizione: 'Technical File per Classe IIa secondo MDR 2017/745',
    owner_obs_id: 'QA/RA Consultant'
  },
  {
    pbs_id: 'PBS-3.1.1',
    parent_id: 'PBS-3.1',
    nome: 'Risk Management File (ISO 14971)',
    descrizione: 'Analisi rischi, FMEA, Risk-Benefit'
  },
  {
    pbs_id: 'PBS-3.1.2',
    parent_id: 'PBS-3.1',
    nome: 'Clinical Evaluation Report',
    descrizione: 'CER secondo MEDDEV 2.7/1 rev 4'
  },
  {
    pbs_id: 'PBS-3.1.3',
    parent_id: 'PBS-3.1',
    nome: 'Test Reports',
    descrizione: 'EMC (IEC 60601-1-2), Safety (IEC 60601-1), Performance'
  },

  {
    pbs_id: 'PBS-3.2',
    parent_id: 'PBS-3',
    nome: 'Manualistica',
    descrizione: 'Manuali utente, service, quick-start',
    owner_obs_id: 'COO'
  },
  {
    pbs_id: 'PBS-3.2.1',
    parent_id: 'PBS-3.2',
    nome: 'Manuale Utente (IFU)',
    descrizione: 'Instructions For Use, multilingua (IT/EN/FR/DE)'
  },
  {
    pbs_id: 'PBS-3.2.2',
    parent_id: 'PBS-3.2',
    nome: 'Service Manual',
    descrizione: 'Manuale manutenzione per tecnici'
  },
  {
    pbs_id: 'PBS-3.2.3',
    parent_id: 'PBS-3.2',
    nome: 'Quick Start Guide',
    descrizione: 'Guida rapida installazione e primo utilizzo'
  },

  // Level 2: Packaging & Accessories
  {
    pbs_id: 'PBS-4.1',
    parent_id: 'PBS-4',
    nome: 'Packaging',
    descrizione: 'Scatola e imballo per spedizione',
    owner_obs_id: 'COO'
  },
  {
    pbs_id: 'PBS-4.1.1',
    parent_id: 'PBS-4.1',
    nome: 'Scatola Esterna',
    descrizione: 'Cartone corrugato stampato, 50x40x30cm'
  },
  {
    pbs_id: 'PBS-4.1.2',
    parent_id: 'PBS-4.1',
    nome: 'Protezione Interna',
    descrizione: 'Foam protettivo custom-cut per device'
  },

  {
    pbs_id: 'PBS-4.2',
    parent_id: 'PBS-4',
    nome: 'Accessori',
    descrizione: 'Cavi, gel, cover, etc.',
    owner_obs_id: 'COO'
  },
  {
    pbs_id: 'PBS-4.2.1',
    parent_id: 'PBS-4.2',
    nome: 'Gel Ultrasuoni',
    descrizione: 'Gel conduttivo sterile, 250ml bottle x2'
  },
  {
    pbs_id: 'PBS-4.2.2',
    parent_id: 'PBS-4.2',
    nome: 'Cavo Alimentazione',
    descrizione: 'Cavo alimentazione medical-grade EU/US/UK, 2m'
  },
  {
    pbs_id: 'PBS-4.2.3',
    parent_id: 'PBS-4.2',
    nome: 'Cover Protettiva Sonda',
    descrizione: 'Cover silicone lavabile per sonda'
  },
  {
    pbs_id: 'PBS-4.2.4',
    parent_id: 'PBS-4.2',
    nome: 'Cavo USB-C',
    descrizione: 'Cavo USB-C 3.1 per connessione PC, 1.5m'
  }
];
