-- Coffres de synchronisation : rien d'autre que l'identifiant, l'empreinte du jeton, le contenu chiffré, sa version
-- et deux dates. Ni adresse IP, ni pseudonyme, ni contenu lisible.
CREATE TABLE IF NOT EXISTS coffres (
  id TEXT PRIMARY KEY,                  -- 32 caractères hexadécimaux, dérivés du code sur l'appareil
  empreinte_jeton TEXT NOT NULL,        -- SHA-256 du jeton d'accès, en hexadécimal
  contenu TEXT NOT NULL,                -- contenu chiffré (AES-256-GCM), 256 Ko au plus
  version INTEGER NOT NULL,             -- contrôle des écritures concurrentes
  cree_le INTEGER NOT NULL,             -- millisecondes depuis 1970
  ecrit_le INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS coffres_ecrit_le ON coffres (ecrit_le);
