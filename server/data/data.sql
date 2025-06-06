CREATE TABLE users (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT    UNIQUE NOT NULL,
  password TEXT    NOT NULL
);

CREATE TABLE todos (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id  BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text     TEXT           NOT NULL,
  checked  BOOLEAN        NOT NULL DEFAULT FALSE
);