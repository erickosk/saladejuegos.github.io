-- Esquema sugerido (PostgreSQL). Refleja lo que hoy guarda datos.js en el navegador.
CREATE TABLE usuarios (
  id            TEXT PRIMARY KEY,
  nombre        TEXT NOT NULL UNIQUE,
  correo        TEXT NOT NULL UNIQUE,
  clave_hash    TEXT NOT NULL,            -- bcrypt/argon2, calculado en el SERVIDOR
  color         TEXT NOT NULL DEFAULT '#5f7cff',
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Una fila por partida (idempotente: el id lo genera el cliente, así reenviar no duplica)
CREATE TABLE partidas (
  id            TEXT PRIMARY KEY,
  usuario_id    TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  juego         TEXT NOT NULL,            -- 'tetris', 'memorama', ...
  puntaje       INTEGER NOT NULL,
  ganada        BOOLEAN NOT NULL DEFAULT FALSE,
  segundos      INTEGER NOT NULL DEFAULT 0,
  fecha         TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON partidas (usuario_id, juego, fecha DESC);

-- Resumen por usuario y juego (se puede mantener con un trigger o calcular con una vista)
CREATE TABLE progreso_juego (
  usuario_id    TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  juego         TEXT,
  partidas      INTEGER NOT NULL DEFAULT 0,
  victorias     INTEGER NOT NULL DEFAULT 0,
  mejor         INTEGER,                  -- en memorama es el MÍNIMO de intentos
  puntos_total  BIGINT  NOT NULL DEFAULT 0,
  segundos      BIGINT  NOT NULL DEFAULT 0,
  ultima_vez    TIMESTAMPTZ,
  PRIMARY KEY (usuario_id, juego)
);

CREATE TABLE logros_usuario (
  usuario_id    TEXT REFERENCES usuarios(id) ON DELETE CASCADE,
  logro         TEXT,
  conseguido    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (usuario_id, logro)
);
