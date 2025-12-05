-- PostgreSQL database dump

CREATE TABLE public."AREA" (
    area_id character varying(3) NOT NULL,
    area_name character varying(36) NOT NULL
);

CREATE TABLE public."FINANCIALS" (
    txn_id bigint NOT NULL,
    source character varying(50),
    amount money NOT NULL,
    currency character varying(3) NOT NULL,
    purpose character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    admin_id bigint NOT NULL
);

CREATE TABLE public."INCIDENTS" (
    incident_id bigint NOT NULL,
    title character varying(80) NOT NULL,
    type character varying(30) NOT NULL,
    severity integer NOT NULL,
    area_id character varying(5) NOT NULL,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    reporter_id bigint NOT NULL,
    address character varying(100) DEFAULT NULL::character varying,
    status character varying(20) DEFAULT 'Occuring'::character varying NOT NULL,
    msg character varying(500),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    reviewed_at timestamp with time zone,
    reviewer_id bigint NOT NULL,
    review_status character varying(20) DEFAULT 'Unverified'::character varying,
    review_note character varying(500),
    CONSTRAINT severity CHECK (((severity >= 1) AND (severity <= 5)))
);

CREATE TABLE public."INVENTORIES" (
    inventory_id bigint NOT NULL,
    status character varying(20) NOT NULL,
    address character varying(100) NOT NULL,
    name character varying(100) DEFAULT 'My Warehouse'::character varying NOT NULL,
    CONSTRAINT "INVENTORIES_status_check" CHECK (((status)::text = ANY (ARRAY[('Public'::character varying)::text, ('Private'::character varying)::text, ('Inactive'::character varying)::text])))
);

CREATE TABLE public."INVENTORY_ITEMS" (
    inventory_id bigint NOT NULL,
    item_id bigint NOT NULL,
    qty integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(20)
);

CREATE TABLE public."INVENTORY_OWNERS" (
    inventory_id bigint NOT NULL,
    user_id bigint NOT NULL
);

CREATE TABLE public."ITEMS" (
    item_id bigint NOT NULL,
    item_name character varying(100) NOT NULL,
    category_id integer NOT NULL,
    unit character varying(10) NOT NULL
);

CREATE TABLE public."ITEM_CATEGORIES" (
    category_id bigint NOT NULL,
    category_name character varying(50) NOT NULL,
    is_tool boolean NOT NULL
);

CREATE TABLE public."REQUEST_ITEM_ACCEPT" (
    request_id integer CONSTRAINT "ITEM_REQUEST_ACCEPT_request_Id_not_null" NOT NULL,
    accepter_id integer CONSTRAINT "ITEM_REQUEST_ACCEPT_accepter_id_not_null" NOT NULL,
    item_id integer CONSTRAINT "ITEM_REQUEST_ACCEPT_item_id_not_null" NOT NULL,
    qty integer CONSTRAINT "ITEM_REQUEST_ACCEPT_qty_not_null" NOT NULL
);

CREATE TABLE public."ITEM_SUPPLIES" (
    item_id bigint NOT NULL,
    expires_in integer
);

CREATE TABLE public."ITEM_TOOLS" (
    item_id bigint NOT NULL,
    conditions character varying(200) NOT NULL,
    manufacturer character varying(50),
    model character varying(50)
);

CREATE TABLE public."LENDS" (
    lend_id bigint NOT NULL,
    user_id bigint NOT NULL,
    item_id bigint NOT NULL,
    qty integer NOT NULL,
    from_inventory_id bigint NOT NULL,
    lend_at timestamp with time zone DEFAULT now() NOT NULL,
    returned_at timestamp with time zone
);

CREATE TABLE public."PROVIDES" (
    provide_id bigint NOT NULL,
    user_id bigint NOT NULL,
    item_id bigint NOT NULL,
    qty integer NOT NULL,
    provide_date timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public."REQUESTS" (
    request_id bigint NOT NULL,
    requester_id bigint NOT NULL,
    incident_id bigint NOT NULL,
    status character varying(50) DEFAULT 'Not Completed'::character varying NOT NULL,
    type character varying(50) NOT NULL,
    address text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    reviewer_id bigint,
    review_status character varying(50),
    review_note text,
    reviewed_at timestamp with time zone,
    urgency integer NOT NULL,
    required_qty integer DEFAULT 0,
    current_qty integer DEFAULT 0,
    CONSTRAINT status CHECK (((status)::text = ANY (ARRAY[('Not Completed'::character varying)::text, ('Completed'::character varying)::text]))),
    CONSTRAINT type_check CHECK (((type)::text = ANY (ARRAY[('Material'::character varying)::text, ('Tool'::character varying)::text, ('Humanpower'::character varying)::text]))),
    CONSTRAINT urgency_check CHECK (((urgency >= 1) AND (urgency <= 5)))
);

CREATE TABLE public."REQUEST_ACCEPTS" (
    request_id bigint NOT NULL,
    accepter_id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    "ETA" time with time zone,
    description text,
    source text
);

CREATE TABLE public."REQUEST_EQUIPMENTS" (
    request_id bigint CONSTRAINT "RESCUE_EQUIPMENTS_request_id_not_null" NOT NULL,
    required_equipment bigint CONSTRAINT "RESCUE_EQUIPMENTS_required_equipment_not_null" NOT NULL,
    qty integer CONSTRAINT "RESCUE_EQUIPMENTS_qty_not_null" NOT NULL
);

CREATE TABLE public."REQUEST_HUMANPOWER" (
    request_id bigint CONSTRAINT "RESCUE_SKILLS_request_id_not_null" NOT NULL,
    skill_tag_id integer NOT NULL,
    qty integer NOT NULL
);

CREATE TABLE public."REQUEST_MATERIALS" (
    request_id integer CONSTRAINT "REQUEST_ITEMS_request_id_not_null" NOT NULL,
    item_id integer CONSTRAINT "REQUEST_ITEMS_item_id_not_null" NOT NULL,
    qty integer DEFAULT 1 CONSTRAINT "REQUEST_ITEMS_qty_not_null" NOT NULL
);

CREATE TABLE public."REQUEST_RESCUE_ACCEPT" (
    request_id integer NOT NULL,
    accepter_id integer NOT NULL,
    qty integer NOT NULL
);

CREATE TABLE public."SHELTERS" (
    shelter_id bigint NOT NULL,
    name character varying(128) NOT NULL,
    address character varying(128) NOT NULL,
    phone character varying(11),
    capacity integer NOT NULL,
    type character varying(50) NOT NULL,
    latitude double precision,
    longitude double precision,
    area_id character varying(3) NOT NULL
);

CREATE TABLE public."SKILL_TAGS" (
    skill_tag_id bigint NOT NULL,
    skill_tag_name character varying(100) NOT NULL
);

CREATE TABLE public."USERS" (
    user_id bigint NOT NULL,
    name character varying(30) NOT NULL,
    role character varying(15) DEFAULT 'Member'::character varying NOT NULL,
    phone character varying(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(10) DEFAULT 'Active'::character varying NOT NULL
);
