/**
 * Internationalization (i18n) Configuration
 * 
 * All medical guidance and UI text abstracted for multi-language support.
 * Based on WHO/UNICEF standards for accuracy.
 */

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'hi';

export interface Translations {
  // App-wide
  app: {
    name: string;
    tagline: string;
  };
  
  // THE WAIT Phase
  wait: {
    title: string;
    auraButton: {
      idle: string;
      active: string;
      release: string;
    };
    breathing: {
      inhale: string;
      exhale: string;
      hold: string;
    };
    contractions: {
      title: string;
      duration: string;
      interval: string;
      count: string;
    };
    fiveOneOne: {
      title: string;
      description: string;
      criteria: string;
      guidance: string;
      callToAction: string;
    };
  };
  
  // THE MOMENT Phase
  moment: {
    trigger: {
      prompt: string;
      holdInstruction: string;
      confirmation: string;
    };
    celebration: {
      title: string;
      subtitle: string;
    };
    goldenHour: {
      title: string;
      description: string;
      skinToSkin: string;
      firstFeed: string;
      bonding: string;
    };
  };
  
  // THE RHYTHM Phase
  rhythm: {
    title: string;
    feeding: {
      title: string;
      leftSide: string;
      rightSide: string;
      bottle: string;
      duration: string;
      lastFeed: string;
      onDemand: string;
      guidance: string;
    };
    diaper: {
      title: string;
      wet: string;
      dirty: string;
      both: string;
      dayExpectation: string;
    };
    milestones: {
      title: string;
      day: string;
      expected: string;
    };
  };
  
  // Medical guidance
  medical: {
    disclaimer: string;
    contactProvider: string;
    emergency: string;
  };
  
  // Common
  common: {
    start: string;
    stop: string;
    save: string;
    cancel: string;
    confirm: string;
    settings: string;
    sync: string;
    offline: string;
    online: string;
  };
}

export const translations: Record<SupportedLocale, Translations> = {
  en: {
    app: {
      name: 'Baby',
      tagline: 'Your journey, beautifully guided',
    },
    wait: {
      title: 'The Wait',
      auraButton: {
        idle: 'Touch & Hold',
        active: 'Breathe with me',
        release: 'Release when done',
      },
      breathing: {
        inhale: 'Inhale',
        exhale: 'Exhale',
        hold: 'Hold',
      },
      contractions: {
        title: 'Contractions',
        duration: 'Duration',
        interval: 'Interval',
        count: 'Count',
      },
      fiveOneOne: {
        title: 'Care Guidance',
        description: 'Your contractions are following the 5-1-1 pattern',
        criteria: '5 minutes apart, lasting 1 minute, for 1 hour',
        guidance: 'This pattern often indicates active labor. Consider contacting your healthcare provider.',
        callToAction: 'Contact Provider',
      },
    },
    moment: {
      trigger: {
        prompt: 'Baby is Here',
        holdInstruction: 'Hold for 3 seconds to celebrate',
        confirmation: 'Welcome to the world',
      },
      celebration: {
        title: 'Congratulations',
        subtitle: 'A new chapter begins',
      },
      goldenHour: {
        title: 'The Golden Hour',
        description: 'The first hour after birth is precious for bonding',
        skinToSkin: 'Skin-to-skin contact helps regulate baby\'s temperature and heartbeat',
        firstFeed: 'Baby may show feeding cues - rooting, hand to mouth',
        bonding: 'Take this time to rest and connect with your baby',
      },
    },
    rhythm: {
      title: 'The Rhythm',
      feeding: {
        title: 'Feeding',
        leftSide: 'Left',
        rightSide: 'Right',
        bottle: 'Bottle',
        duration: 'Duration',
        lastFeed: 'Last feed',
        onDemand: 'On-Demand Feeding',
        guidance: 'Feed when baby shows hunger cues, typically 8-12 times in 24 hours',
      },
      diaper: {
        title: 'Diaper Log',
        wet: 'Wet',
        dirty: 'Dirty',
        both: 'Both',
        dayExpectation: 'Day {{day}}: Expect {{wet}} wet, {{dirty}} dirty diapers',
      },
      milestones: {
        title: 'Health Milestones',
        day: 'Day',
        expected: 'Expected',
      },
    },
    medical: {
      disclaimer: 'This app provides general guidance only. Always consult your healthcare provider for medical advice.',
      contactProvider: 'Contact your healthcare provider',
      emergency: 'In case of emergency, call emergency services immediately',
    },
    common: {
      start: 'Start',
      stop: 'Stop',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      settings: 'Settings',
      sync: 'Syncing',
      offline: 'Offline',
      online: 'Online',
    },
  },
  
  // Spanish
  es: {
    app: {
      name: 'Baby',
      tagline: 'Tu viaje, bellamente guiado',
    },
    wait: {
      title: 'La Espera',
      auraButton: {
        idle: 'Toca y Mantén',
        active: 'Respira conmigo',
        release: 'Suelta cuando termine',
      },
      breathing: {
        inhale: 'Inhala',
        exhale: 'Exhala',
        hold: 'Mantén',
      },
      contractions: {
        title: 'Contracciones',
        duration: 'Duración',
        interval: 'Intervalo',
        count: 'Cuenta',
      },
      fiveOneOne: {
        title: 'Guía de Cuidado',
        description: 'Tus contracciones siguen el patrón 5-1-1',
        criteria: '5 minutos de intervalo, durando 1 minuto, por 1 hora',
        guidance: 'Este patrón a menudo indica trabajo de parto activo. Considera contactar a tu proveedor de salud.',
        callToAction: 'Contactar Proveedor',
      },
    },
    moment: {
      trigger: {
        prompt: 'El Bebé Llegó',
        holdInstruction: 'Mantén 3 segundos para celebrar',
        confirmation: 'Bienvenido al mundo',
      },
      celebration: {
        title: 'Felicidades',
        subtitle: 'Un nuevo capítulo comienza',
      },
      goldenHour: {
        title: 'La Hora Dorada',
        description: 'La primera hora después del nacimiento es preciosa para el vínculo',
        skinToSkin: 'El contacto piel a piel ayuda a regular la temperatura y el ritmo cardíaco del bebé',
        firstFeed: 'El bebé puede mostrar señales de alimentación - buscar, mano a la boca',
        bonding: 'Toma este tiempo para descansar y conectar con tu bebé',
      },
    },
    rhythm: {
      title: 'El Ritmo',
      feeding: {
        title: 'Alimentación',
        leftSide: 'Izquierda',
        rightSide: 'Derecha',
        bottle: 'Biberón',
        duration: 'Duración',
        lastFeed: 'Última alimentación',
        onDemand: 'Alimentación a Demanda',
        guidance: 'Alimenta cuando el bebé muestre señales de hambre, típicamente 8-12 veces en 24 horas',
      },
      diaper: {
        title: 'Registro de Pañales',
        wet: 'Mojado',
        dirty: 'Sucio',
        both: 'Ambos',
        dayExpectation: 'Día {{day}}: Espera {{wet}} mojados, {{dirty}} sucios',
      },
      milestones: {
        title: 'Hitos de Salud',
        day: 'Día',
        expected: 'Esperado',
      },
    },
    medical: {
      disclaimer: 'Esta aplicación proporciona orientación general solamente. Siempre consulta a tu proveedor de salud para consejos médicos.',
      contactProvider: 'Contacta a tu proveedor de salud',
      emergency: 'En caso de emergencia, llama a servicios de emergencia inmediatamente',
    },
    common: {
      start: 'Iniciar',
      stop: 'Detener',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      settings: 'Configuración',
      sync: 'Sincronizando',
      offline: 'Sin conexión',
      online: 'En línea',
    },
  },
  
  // Placeholder for other languages - would be filled in production
  fr: {} as Translations,
  de: {} as Translations,
  zh: {} as Translations,
  ja: {} as Translations,
  ar: {} as Translations,
  hi: {} as Translations,
};

// Default to English
export const defaultLocale: SupportedLocale = 'en';

// Helper function to get translation
export function t(locale: SupportedLocale = defaultLocale): Translations {
  return translations[locale] || translations.en;
}

// Diaper expectations by day (WHO/UNICEF standards)
export const diaperExpectations = [
  { day: 1, wet: 1, dirty: 1 },
  { day: 2, wet: 2, dirty: 2 },
  { day: 3, wet: 3, dirty: 2 },
  { day: 4, wet: 4, dirty: 3 },
  { day: 5, wet: 5, dirty: 3 },
  { day: 6, wet: 6, dirty: 3 },
  { day: 7, wet: 6, dirty: 3 },
];

export default translations;
