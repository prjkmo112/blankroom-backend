CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- user 테이블
CREATE TABLE blankroom.public.users
(
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    userid    TEXT UNIQUE NOT NULL
        CONSTRAINT users_userid_check
            CHECK (userid ~ '^[a-zA-Z0-9\-_]{3,20}$'),
    password    TEXT NOT NULL,
    nickname    TEXT NOT NULL
        CONSTRAINT users_nickname_check
            CHECK (char_length(nickname) BETWEEN 1 AND 20),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blankroom.public.users IS 'user 테이블';
COMMENT ON COLUMN blankroom.public.users.id IS 'UUID (DB 내부 식별용)';
COMMENT ON COLUMN blankroom.public.users.userid IS '로그인용 고유 ID (3~20자, 영문/숫자/-, _)';
COMMENT ON COLUMN blankroom.public.users.password IS '해시 처리된 비밀번호';
COMMENT ON COLUMN blankroom.public.users.nickname IS '표시 이름 (익명성 유지)';
COMMENT ON COLUMN blankroom.public.users.created_at IS '계정 생성 시각';

ALTER TABLE blankroom.public.users
    OWNER TO bruser;


-- 실시간 협업 방 정보를 저장하는 테이블
CREATE TABLE blankroom.public.rooms
(
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id   TEXT UNIQUE NOT NULL
        CONSTRAINT rooms_short_id_check
            CHECK (short_id ~ '^[a-zA-Z0-9\-_]{10}$'::text),
    name        TEXT NOT NULL,
    description TEXT,
    password    CHAR(6)
        CONSTRAINT rooms_password_check
            CHECK ((password IS NULL) OR (password ~ '^\d{6}$'::text)),
    created_at  timestamp with time zone DEFAULT NOW()
);

COMMENT ON table rooms is '실시간 협업 방 정보를 저장하는 테이블';
COMMENT ON column rooms.id is 'UUID';
COMMENT ON column rooms.short_id is 'url 공유용 짧은 id';
COMMENT ON column rooms.name is '방 이름 (필수)';
COMMENT ON column rooms.description is '방 설명 (선택 사항)';
COMMENT ON column rooms.password is '방 비밀번호: 숫자 6자리 (nullable, 예: "123456")';
COMMENT ON column rooms.created_at is '방 생성 시각 (타임존 포함, 자동 기록)';

alter table rooms
    owner to bruser;


-- Canvas 드로잉 데이터를 저장하는 테이블
CREATE TABLE blankroom.public.boards
(
    room_id     TEXT PRIMARY KEY
        REFERENCES blankroom.public.rooms(id)
        ON DELETE CASCADE,
    image_data  BYTEA NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blankroom.public.boards IS 'Canvas 드로잉 데이터를 저장하는 테이블';
COMMENT ON COLUMN blankroom.public.boards.room_id IS '연결된 Room의 ID (외래키)';
COMMENT ON COLUMN blankroom.public.boards.image_data IS 'Canvas의 이미지 데이터 (Blob 형태, BYTEA)';
COMMENT ON COLUMN blankroom.public.boards.created_at IS '최초 저장 시간';
COMMENT ON COLUMN blankroom.public.boards.updated_at IS '최종 수정 시간';

ALTER TABLE blankroom.public.boards
    OWNER TO bruser;


-- 채팅 메시지를 저장하는 테이블
CREATE TABLE blankroom.public.chat_messages
(
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     TEXT NOT NULL
        REFERENCES blankroom.public.rooms(id)
        ON DELETE CASCADE,
    user_id     TEXT NOT NULL
        REFERENCES blankroom.public.users(id)
        ON DELETE CASCADE,
    message     TEXT NOT NULL
        CONSTRAINT chat_messages_message_check
            CHECK (char_length(message) BETWEEN 1 AND 1000),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE blankroom.public.chat_messages IS '채팅 메시지를 저장하는 테이블';
COMMENT ON COLUMN blankroom.public.chat_messages.id IS '메시지 고유 ID (UUID)';
COMMENT ON COLUMN blankroom.public.chat_messages.room_id IS '연결된 Room의 ID (외래키)';
COMMENT ON COLUMN blankroom.public.chat_messages.user_id IS '메시지 작성자 ID (외래키)';
COMMENT ON COLUMN blankroom.public.chat_messages.message IS '채팅 메시지 내용 (1~1000자)';
COMMENT ON COLUMN blankroom.public.chat_messages.created_at IS '메시지 작성 시간';

ALTER TABLE blankroom.public.chat_messages
    OWNER TO bruser;

-- 채팅 메시지 인덱스 (조회 성능 향상)
CREATE INDEX idx_chat_messages_room_id_created_at 
ON blankroom.public.chat_messages(room_id, created_at);

CREATE INDEX idx_chat_messages_user_id 
ON blankroom.public.chat_messages(user_id);
