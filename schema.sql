--
-- PostgreSQL database dump
--

\restrict RUxWRq2DO4e47khp9BO2JSCfttiGpKQfwGOI0tC1bfFljhZVamJMvE0BeynImSf

-- Dumped from database version 16.13 (Homebrew)
-- Dumped by pg_dump version 16.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    entity_type character varying(20),
    entity_id integer,
    user_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    action character varying(50),
    entity_label character varying(100)
);


ALTER TABLE public.activity_logs OWNER TO ertekaaz;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO ertekaaz;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    entity_type character varying(20),
    entity_id integer,
    file_url text NOT NULL,
    file_name character varying(255),
    file_size integer,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT attachments_entity_type_check CHECK (((entity_type)::text = ANY ((ARRAY['order'::character varying, 'lead'::character varying, 'quotation'::character varying])::text[])))
);


ALTER TABLE public.attachments OWNER TO ertekaaz;

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachments_id_seq OWNER TO ertekaaz;

--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    client_id character varying(100) NOT NULL,
    full_name character varying(150) NOT NULL,
    company_name character varying(150),
    gst_number character varying(50),
    contact_1_name character varying(100),
    contact_1_no character varying(20),
    contact_2_name character varying(100),
    contact_2_no character varying(20),
    contact_3_name character varying(100),
    contact_3_no character varying(20),
    contact_4_name character varying(100),
    contact_4_no character varying(20),
    accountant_name character varying(100),
    accountant_no character varying(20),
    email character varying(150),
    address text,
    is_archived boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.clients OWNER TO ertekaaz;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO ertekaaz;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    entity_type character varying(20),
    entity_id integer,
    user_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    parent_id integer,
    CONSTRAINT comments_entity_type_check CHECK (((entity_type)::text = ANY ((ARRAY['order'::character varying, 'quotation'::character varying, 'client'::character varying, 'lead'::character varying, 'task'::character varying])::text[])))
);


ALTER TABLE public.comments OWNER TO ertekaaz;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO ertekaaz;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: lead_quotations; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.lead_quotations (
    id integer NOT NULL,
    lead_id integer,
    quotation_id integer
);


ALTER TABLE public.lead_quotations OWNER TO ertekaaz;

--
-- Name: lead_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.lead_quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_quotations_id_seq OWNER TO ertekaaz;

--
-- Name: lead_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.lead_quotations_id_seq OWNED BY public.lead_quotations.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    lead_id character varying(20) NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    client_id integer,
    client_manual_name character varying(150),
    client_manual_contact character varying(50),
    job_type character varying(100),
    quantity character varying(100),
    specifications text,
    delivery_expected date,
    entered_by integer,
    status character varying(50) DEFAULT 'open'::character varying,
    order_id integer,
    converted_client_id integer,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    is_archived boolean DEFAULT false
);


ALTER TABLE public.leads OWNER TO ertekaaz;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO ertekaaz;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO ertekaaz;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO ertekaaz;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_assignees; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.order_assignees (
    id integer NOT NULL,
    order_id integer,
    user_id integer
);


ALTER TABLE public.order_assignees OWNER TO ertekaaz;

--
-- Name: order_assignees_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.order_assignees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_assignees_id_seq OWNER TO ertekaaz;

--
-- Name: order_assignees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.order_assignees_id_seq OWNED BY public.order_assignees.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    job_id character varying(20) NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    client_id integer,
    job_type character varying(100),
    quantity character varying(100),
    specifications text,
    delivery_expected date,
    quotation_ref_id integer,
    quotation_manual_no character varying(100),
    quotation_manual_amount numeric(10,2),
    advance numeric(10,2) DEFAULT 0,
    balance numeric(10,2) DEFAULT 0,
    prepared_by integer,
    status character varying(50) DEFAULT 'negotiation'::character varying,
    is_archived boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    project_name character varying(150),
    proforma_invoice_number character varying(100),
    invoice_number character varying(100),
    job_link text,
    notes text,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['negotiation'::character varying, 'quotation'::character varying, 'proforma'::character varying, 'designing'::character varying, 'review'::character varying, 'corrections'::character varying, 'pre-press'::character varying, 'printing'::character varying, 'tax invoice'::character varying, 'invoice pending'::character varying, 'ready at office'::character varying, 'out for delivery'::character varying, 'waiting pickup'::character varying, 'completed'::character varying, 'long pending'::character varying])::text[])))
);


ALTER TABLE public.orders OWNER TO ertekaaz;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO ertekaaz;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.quotation_items (
    id integer NOT NULL,
    quotation_id integer,
    description text,
    quantity numeric(10,2),
    rate numeric(10,2),
    amount numeric(10,2),
    sort_order integer DEFAULT 0,
    item_name character varying(150)
);


ALTER TABLE public.quotation_items OWNER TO ertekaaz;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotation_items_id_seq OWNER TO ertekaaz;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quotation_id character varying(20) NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    client_id integer,
    tax_mode character varying(20) DEFAULT 'exclusive'::character varying,
    show_tax_details boolean DEFAULT true,
    terms_and_conditions text,
    signature_block boolean DEFAULT true,
    order_id integer,
    lead_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    subject character varying(255),
    notes text,
    discount_amount numeric(10,2) DEFAULT 0,
    discount_type character varying(20) DEFAULT 'fixed'::character varying,
    is_archived boolean DEFAULT false,
    manual_client_name text,
    manual_client_address text,
    manual_client_phone text,
    manual_client_email text,
    is_deleted boolean DEFAULT false,
    hide_totals boolean DEFAULT false,
    CONSTRAINT quotations_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['fixed'::character varying, 'percentage'::character varying])::text[]))),
    CONSTRAINT quotations_tax_mode_check CHECK (((tax_mode)::text = ANY ((ARRAY['inclusive'::character varying, 'exclusive'::character varying])::text[])))
);


ALTER TABLE public.quotations OWNER TO ertekaaz;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotations_id_seq OWNER TO ertekaaz;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.reminders (
    id integer NOT NULL,
    task_id integer,
    user_id integer,
    remind_at timestamp without time zone NOT NULL,
    is_dismissed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reminders OWNER TO ertekaaz;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminders_id_seq OWNER TO ertekaaz;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO ertekaaz;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO ertekaaz;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: task_assignees; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.task_assignees (
    id integer NOT NULL,
    task_id integer,
    user_id integer
);


ALTER TABLE public.task_assignees OWNER TO ertekaaz;

--
-- Name: task_assignees_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.task_assignees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_assignees_id_seq OWNER TO ertekaaz;

--
-- Name: task_assignees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.task_assignees_id_seq OWNED BY public.task_assignees.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    created_by integer,
    client_id integer,
    order_id integer,
    status character varying(20) DEFAULT 'open'::character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    due_date date,
    is_important boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['in_queue'::character varying, 'working'::character varying, 'waiting'::character varying, 'done'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO ertekaaz;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO ertekaaz;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ertekaaz
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['executive'::character varying, 'admin'::character varying, 'superadmin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO ertekaaz;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ertekaaz
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO ertekaaz;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ertekaaz
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: lead_quotations id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.lead_quotations ALTER COLUMN id SET DEFAULT nextval('public.lead_quotations_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_assignees id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.order_assignees ALTER COLUMN id SET DEFAULT nextval('public.order_assignees_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: task_assignees id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.task_assignees ALTER COLUMN id SET DEFAULT nextval('public.task_assignees_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: clients clients_client_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_client_id_key UNIQUE (client_id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: lead_quotations lead_quotations_lead_id_quotation_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.lead_quotations
    ADD CONSTRAINT lead_quotations_lead_id_quotation_id_key UNIQUE (lead_id, quotation_id);


--
-- Name: lead_quotations lead_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.lead_quotations
    ADD CONSTRAINT lead_quotations_pkey PRIMARY KEY (id);


--
-- Name: leads leads_lead_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_lead_id_key UNIQUE (lead_id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_assignees order_assignees_order_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.order_assignees
    ADD CONSTRAINT order_assignees_order_id_user_id_key UNIQUE (order_id, user_id);


--
-- Name: order_assignees order_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.order_assignees
    ADD CONSTRAINT order_assignees_pkey PRIMARY KEY (id);


--
-- Name: orders orders_job_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_job_id_key UNIQUE (job_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quotation_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_id_key UNIQUE (quotation_id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_task_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_user_id_key UNIQUE (task_id, user_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quotations fk_quotation_lead; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_quotation_lead FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: quotations fk_quotation_order; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT fk_quotation_order FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: lead_quotations lead_quotations_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.lead_quotations
    ADD CONSTRAINT lead_quotations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: lead_quotations lead_quotations_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.lead_quotations
    ADD CONSTRAINT lead_quotations_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: leads leads_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: leads leads_converted_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_converted_client_id_fkey FOREIGN KEY (converted_client_id) REFERENCES public.clients(id);


--
-- Name: leads leads_entered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_entered_by_fkey FOREIGN KEY (entered_by) REFERENCES public.users(id);


--
-- Name: leads leads_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_assignees order_assignees_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.order_assignees
    ADD CONSTRAINT order_assignees_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_assignees order_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.order_assignees
    ADD CONSTRAINT order_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: orders orders_prepared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_prepared_by_fkey FOREIGN KEY (prepared_by) REFERENCES public.users(id);


--
-- Name: orders orders_quotation_ref_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_quotation_ref_id_fkey FOREIGN KEY (quotation_ref_id) REFERENCES public.quotations(id);


--
-- Name: quotation_items quotation_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quotations quotations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: quotations quotations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: reminders reminders_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: reminders reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_assignees task_assignees_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_assignees task_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ertekaaz
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- PostgreSQL database dump complete
--

\unrestrict RUxWRq2DO4e47khp9BO2JSCfttiGpKQfwGOI0tC1bfFljhZVamJMvE0BeynImSf

