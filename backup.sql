--
-- PostgreSQL database dump
--

\restrict G9jESaX6dDEjI3bnYjgtloGPDUoXg6FbPe2gr3ul812EB9y5PRs8rljQcMbzGTb

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
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.activity_logs (id, entity_type, entity_id, user_id, message, created_at, action, entity_label) FROM stdin;
1	client	256	5	field_edited: email: "" → "hannan778866@gmail.com"	2026-03-02 12:09:37.625	\N	\N
2	client	256	5	field_edited: billingAddress: "Shop No. 4, Shreeji Dham CHS, Ltd," → "Skyline Prime, Plot No.365/366, Sector 19, Ulwe,"	2026-03-02 12:09:37.626	\N	\N
3	client	257	5	client_created: Client created	2026-03-02 13:36:05.049	\N	\N
4	client	258	3	client_created: Client created	2026-03-10 06:45:34.211	\N	\N
5	client	259	6	client_created: Client created	2026-03-11 02:43:40.089	\N	\N
6	client	259	6	archived: Client archived	2026-03-11 02:46:46.222	\N	\N
7	client	260	6	client_created: Client created	2026-03-11 02:47:56.943	\N	\N
8	client	260	5	field_edited: companyName: "Shelter Builders" → "SHELTER BUILDERS"	2026-03-11 02:55:01.467	\N	\N
9	client	261	3	client_created: Client created	2026-03-11 07:43:13.803	\N	\N
10	client	261	3	client_created: Client created	2026-03-11 07:43:17.73	\N	\N
11	client	262	1	client_created: Client created	2026-03-12 05:48:39.959	\N	\N
12	client	263	6	client_created: Client created	2026-03-16 09:48:28.287	\N	\N
13	client	264	5	client_created: Client created	2026-03-16 09:50:03.505	\N	\N
14	client	265	5	client_created: Client created	2026-03-16 09:51:39.769	\N	\N
15	client	266	5	client_created: Client created	2026-03-16 09:55:42.114	\N	\N
16	client	267	5	client_created: Client created	2026-03-16 10:08:50.621	\N	\N
17	client	267	5	field_edited: accountantName: "undefined" → "Deepak Karande"	2026-03-16 10:10:24.746	\N	\N
18	client	267	5	field_edited: gstNumber: "" → "27AAJFO9996N1ZZ"	2026-03-16 10:10:24.746	\N	\N
19	client	267	5	field_edited: accountantNo: "undefined" → "+919702577247"	2026-03-16 10:10:24.747	\N	\N
20	client	268	5	client_created: Client created	2026-03-17 07:34:43.863	\N	\N
21	client	269	3	client_created: Client created	2026-03-23 07:55:09.99	\N	\N
22	client	270	3	client_created: Client created	2026-03-27 09:55:53.937	\N	\N
23	client	270	3	client_created: Client created	2026-03-27 09:55:57.073	\N	\N
24	client	270	3	client_created: Client created	2026-03-27 09:55:58.233	\N	\N
25	client	271	5	client_created: Client created	2026-03-28 11:47:54.891	\N	\N
26	client	272	5	client_created: Client created	2026-03-30 10:26:00.217	\N	\N
27	client	272	5	field_edited: billingAddress: "" → "No. 69, Sector 21, Kharghar, "	2026-03-30 10:27:24.774	\N	\N
28	client	272	5	field_edited: billingPinCode: "" → "410210"	2026-03-30 10:27:24.775	\N	\N
29	client	272	5	field_edited: billingCity: "" → "Navi Mumbai"	2026-03-30 10:27:24.775	\N	\N
30	client	273	3	client_created: Client created	2026-03-31 07:04:22.529	\N	\N
31	client	274	5	client_created: Client created	2026-03-31 07:08:55.623	\N	\N
32	client	275	5	client_created: Client created	2026-04-01 03:52:42.196	\N	\N
33	client	276	5	client_created: Client created	2026-04-01 05:46:30.911	\N	\N
34	client	277	5	client_created: Client created	2026-04-01 05:53:01.834	\N	\N
35	client	278	3	client_created: Client created	2026-04-02 05:29:31.622	\N	\N
36	client	279	1	client_created: Client created	2026-04-02 11:18:50.571	\N	\N
37	client	280	5	client_created: Client created	2026-04-02 12:38:28.952	\N	\N
38	client	280	5	archived: Client archived	2026-04-02 12:40:55.455	\N	\N
39	lead	6	6	lead_edited: Lead updated	2026-03-12 20:33:03.856	\N	\N
40	lead	6	5	status_changed: "New" → "Won"	2026-03-13 01:01:49.521	\N	\N
41	lead	1	6	status_changed: "Won" → "New"	2026-03-12 20:35:02.004	\N	\N
42	lead	1	6	status_changed: "New" → "Lost"	2026-03-12 20:35:04.842	\N	\N
43	lead	1	6	status_changed: "Lost" → "Won"	2026-03-12 20:35:07.84	\N	\N
44	lead	7	6	lead_edited: Lead updated	2026-03-13 07:15:46.225	\N	\N
45	client	281	6	edited client CLT-1775557240692	2026-04-09 22:05:59.173291	edited	CLT-1775557240692
46	client	281	6	edited client CLT-1775557240692	2026-04-09 22:06:30.075998	edited	CLT-1775557240692
47	order	126	6	edited order 20260407-001	2026-04-09 22:08:39.956858	edited	20260407-001
48	quotation	35	6	deleted quotation QT-0033	2026-04-09 22:46:40.543802	deleted	QT-0033
49	lead	7	6	Converted lead lead_1773292659597 to: order	2026-04-09 22:50:16.186627	converted	lead_1773292659597
50	quotation	36	6	created quotation QT-0033	2026-04-09 22:56:08.470047	created	QT-0033
51	quotation	36	6	Date: Mon Apr 06 → 2026-04-05; Discount: 0.00 → 0	2026-04-09 22:59:54.351733	edited	QT-0033
52	lead	6	6	Converted lead lead_1773204966011 to: order	2026-04-09 23:00:00.243579	converted	lead_1773204966011
53	order	128	6	Advance: 0.00 → 0	2026-04-09 23:00:13.963218	edited	20260409-002
54	order	128	6	Job Type: Company Profile 8 or 12 Pages → Brochure; Advance: 0.00 → 0	2026-04-09 23:00:27.683917	edited	20260409-002
55	order	128	6	edited order 20260409-002	2026-04-09 23:02:05.501302	edited	20260409-002
56	order	128	6	Job Type: Brochure → Digital Brochure; Advance: 0 → 500	2026-04-09 23:02:17.628589	edited	20260409-002
57	order	128	6	No changes	2026-04-09 23:05:04.756673	edited	20260409-002
58	order	128	6	Saved with no changes	2026-04-09 23:06:09.288671	edited	20260409-002
59	client	281	6	Saved with no changes	2026-04-09 23:09:08.002846	edited	CLT-1775557240692
60	client	281	6	Saved with no changes	2026-04-09 23:09:14.666317	edited	CLT-1775557240692
61	order	128	6	Saved with no changes	2026-04-09 23:12:21.186329	edited	20260409-002
62	order	128	6	Client: Shemoil Momin → Deepak Karande	2026-04-09 23:16:10.475395	edited	20260409-002
63	order	128	6	Specifications: Skyline Contractors\nRe-Designing Rate (Soft Copy only) \n\nPages: 8       Rs.: 14,000/- + GST\nPages: 12     Rs.: 24,000/- + GST\n\nDesign Schedule : Requirted 4 to 5 working days. → Skyline Contractors\nRe-Designing Rate (Soft Copy only) \n\nPages: 8       Rs.: 14,000/- + GST\nPages: 12     Rs.: 24,000/- + GST\n\nDesign Schedule : Requirted 4 to 5 working days	2026-04-09 23:16:20.256453	edited	20260409-002
64	order	128	6	Assignees: (none) → Shemoil	2026-04-09 23:16:33.899483	edited	20260409-002
65	quotation	36	6	Subject: Chalan → Challan; Date: Sun Apr 05 → 2026-04-04; Item 1 Name: Chalan → Chalan - 1; Item 1 Description: (empty) → Check	2026-04-09 23:45:09.635691	edited	QT-0033
66	quotation	36	6	Date: Sat Apr 04 → 2026-04-03	2026-04-09 23:45:28.46442	edited	QT-0033
67	quotation	36	6	Date: Fri Apr 03 → 2026-04-10	2026-04-09 20:06:49.595768	edited	QT-0033
68	quotation	36	6	Date: Fri Apr 10 → 2026-04-09	2026-04-09 20:13:41.714149	edited	QT-0033
69	quotation	36	6	Date: 2026-04-09 → 2026-04-10	2026-04-10 00:20:07.927841	edited	QT-0033
70	quotation	36	6	Date: 2026-04-10 → 2026-04-09	2026-04-10 00:20:22.503132	edited	QT-0033
71	order	38	6	trashed order 20260126-114	2026-04-10 09:54:57.908943	trashed	20260126-114
72	quotation	36	6	trashed quotation QT-0033	2026-04-10 09:55:08.725597	trashed	QT-0033
73	lead	7	6	trashed lead lead_1773292659597	2026-04-10 09:57:59.087722	trashed	lead_1773292659597
74	task	187	6	trashed task Vitthaldham Floor Plan	2026-04-10 09:58:07.173114	trashed	Vitthaldham Floor Plan
75	order	128	5	commented order	2026-04-10 10:50:12.584782	commented	
76	quotation	33	5	commented quotation	2026-04-10 10:52:27.280778	commented	
77	order	38	6	restored order 20260126-114	2026-04-10 10:55:29.150056	restored	20260126-114
78	quotation	36	6	restored quotation QT-0033	2026-04-10 10:55:33.776454	restored	QT-0033
79	order	128	6	Notes: (empty) → Nice; Assignees: Shemoil → Shemoil, Nizam	2026-04-10 18:26:54.805344	edited	20260409-002
80	task	175	6	commented task	2026-04-10 18:28:37.617939	commented	
81	task	175	6	commented task	2026-04-10 18:28:41.122059	commented	
82	task	175	6	commented task	2026-04-10 18:28:57.350216	commented	
83	order	125	6	Status: proforma → designing	2026-04-10 18:33:48.137506	edited	20260402-199
84	order	125	6	Saved with no changes	2026-04-10 18:33:53.470675	edited	20260402-199
85	task	175	6	Status: working → waiting	2026-04-10 18:36:54.939357	edited	Rushish Timbadia Floor Plan Bill
86	order	128	3	Status: negotiation → quotation	2026-04-10 23:21:30.866461	edited	20260409-002
87	order	128	3	Status: quotation → negotiation	2026-04-10 23:21:32.603578	edited	20260409-002
88	order	128	3	Status: negotiation → quotation	2026-04-10 23:21:35.367677	edited	20260409-002
89	order	128	3	Status: quotation → negotiation	2026-04-10 23:54:37.501098	edited	20260409-002
90	order	128	3	Status: negotiation → quotation	2026-04-10 23:54:39.228534	edited	20260409-002
91	quotation	36	6	Saved with no changes	2026-04-11 00:03:49.951168	edited	QT-0033
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.attachments (id, entity_type, entity_id, file_url, file_name, file_size, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.clients (id, client_id, full_name, company_name, gst_number, contact_1_name, contact_1_no, contact_2_name, contact_2_no, contact_3_name, contact_3_no, contact_4_name, contact_4_no, accountant_name, accountant_no, email, address, is_archived, created_at, is_deleted) FROM stdin;
5	1769353988485	Nizamuddin Momin	Ertekaaz Global FZC	\N	\N	0507663464	\N	\N	\N	\N	\N	\N	\N	\N	nizam@shemoil.com	\N	t	2026-04-04 21:22:26.316713	f
6	1769332673229	Shemoil Momin	Ertekaaz Global FZC	\N	\N	+971564123792	\N	+971507663464	\N	\N	\N	\N	\N	\N	info@ertekaaz.com	Sharjah, UAE	t	2026-04-04 21:22:26.316713	f
7	1769397047651	Subhash Bhutia	NCM INTERNATIONAL PRIVATE LIMITED	 27AAACN1543L1ZG	\N	+91 93231 85100	\N	\N	\N	\N	\N	\N	\N	\N	ncminternationalpvtltd@gmail.com	M-67, MIDC Taloja Industrial Area, Taloja City, Taloja Panchnad (CT), Taloja, Panvel, Maharashtra 410208, India	f	2026-04-04 21:22:26.316713	f
8	1769405488489727glijsm	Sachin Shetty	B S R HOMES	27AALFB2101J1ZR	\N	\N	\N	'+919699990490	\N	\N	\N	\N	\N	\N	sagar.kunj.highland@gmail.com	2nd Floor, 2/5, Ratna Niwas, Nehru Road, Dombivli, Thane, Maharashtra, 421201	f	2026-04-04 21:22:26.316713	f
9	1769405490391mlqtspn8m	Ram Marathe	PRAPTI ASSOCIATE	27AKVPM9065C1ZM	\N	\N	\N	'+919820832304	\N	\N	\N	\N	\N	\N	praptiassociate@gmail.com	Shop No. 12, Jay Jaywanti Building, Near CKT School, Sector-15A, New Panvel, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
10	1769405491757r70ea7cob	TRINETRA BUILDERS & DEVELOPERS	TRINETRA BUILDERS & DEVELOPERS	27AAKFT0877A1Z6	\N	\N	\N	'+91 98929 98432	\N	\N	\N	\N	\N	\N	trinetrabuilders@gmail.com	Bhagwan Niwas, Shop No. RRT Road, Mulund (W), Mumbai, 400080	f	2026-04-04 21:22:26.316713	f
11	17694054931845l10njsyp	Ishtiyaque Khan	SUPERMAX BOILER ENGINEERS	27AABPK7312A1ZB	\N	'+912227401786	\N	+919821078786	\N	\N	\N	\N	\N	\N	supermaxboilerengineers@gmail.com	Plot No. L-88, MIDC Taloja, Dist. Raigad, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
12	17694054946072iyw1dq89	MAHIRAH TRAVELS	MAHIRAH TRAVELS	27ACRPK3547R1ZN	\N	'+912227574254	\N	'+919372992105	\N	\N	\N	\N	\N	\N	info@mahirahtravels.com	5 MARUTI TOWERS, SECTOR 11, CBD BELAPUR, Navi Mumbai, 400615	f	2026-04-04 21:22:26.316713	f
13	17694054960238lgewf6ha	Praveen Patel	SADGURU ASSOCIATE	27ACHFS0873N3ZH	\N	\N	\N	'+917875867175	\N	\N	\N	\N	\N	\N	sadgurugroup11@gmail.com	Gut No. 1, Hissa No. 3 & 3A & 1/2, Opp. Sadguru Heritage, Manjarli Char Rasta, Manjarli, Badlapur, 421503	f	2026-04-04 21:22:26.316713	f
14	1769405497403exjm7fg2i	AL YUSRA DEVELOPERS LLP	AL YUSRA DEVELOPERS LLP	27AAZFA9917D1ZX	\N	'+912227741150	\N	\N	\N	\N	\N	\N	\N	\N	alyusradevelopers@gmail.com	Shop No. 5, Plot No. 17/18, Sector-19, Rekhi Sai Daffodils CHS Ltd., Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
15	1769405498819nfj8ihyxb	VASTU INFRASTRUCTURE	VASTU INFRASTRUCTURE	27AAUFV2848K1ZA	\N	+918291079577	\N	\N	\N	\N	\N	\N	\N	\N	vastuinfraastructure@gmail.com	1,2,3,4, Kanak Sarovar CHS., Plot No. 17, Thana Naka Road,, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
16	17694055002166127uj39i	SADGURU DEVELOPERS	SADGURU DEVELOPERS	27ABSFS2772C3ZT	\N	+917875867175	\N	+919320008500	\N	\N	\N	\N	\N	\N	sadgurugroup11@gmail.com	A/107, Sadguru Heritage, Manjarli, Badlapur (W), 421503	f	2026-04-04 21:22:26.316713	f
17	1769405501630f1lq1xc20	Shrushti Developers	Shrushti Developers	27ACYFS9844A2ZF	\N	\N	\N	'+91 9699035005	\N	\N	\N	\N	\N	\N	shrushtidevelopers15@gmail.com	Gut No. 123 and 18, Waliwali Barvi Dam Road, Badlapur (W), 421503	f	2026-04-04 21:22:26.316713	f
18	17694055038837nb5tfbn4	SOCOMED PHARMA PRIVATE LIMITED	SOCOMED PHARMA PRIVATE LIMITED	27AALCS9047D1Z2	\N	+912249733035	\N	\N	\N	\N	\N	\N	\N	\N	scm-purchase@socomedpharma.com	No. 3, Maruti Paradise, Plot No. 93-95, Sector 15, CBD Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
19	1769405505615p5ve4rjef	DEEP LAXMI ASSOCIATES	DEEP LAXMI ASSOCIATES	27AASFD3735B1ZH	\N	'+912512696920	\N	\N	\N	\N	\N	\N	\N	\N	deeplaxmiassociates@gmail.com	GP Parsik Sahakari Bank, GR, Shop 22, Shreeji Center, Ghorpade Chowk, Katrap, Badlapur, 421503	f	2026-04-04 21:22:26.316713	f
20	1769405507099klsgpgujb	MILLENNIUM GROUP	MILLENNIUM GROUP	27ABFFM3007M1Z7	\N	'+919322949805	\N	\N	\N	\N	\N	\N	\N	\N	patelbv223@gmail.com	211, CONCORDE PREMISES CHS LTD., PLOT NO.66-A, SECTOR-11, CBD-BELAPUR,, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
21	1769405508485b8wlll945	Harsh Gupte	NEELKANTH CONSTRUCTION	27AAHFN4430C1ZM	\N	\N	\N	'+919930499909	\N	\N	\N	\N	\N	\N	harsh.gupte99@yahoo.com	Neelkanth Landmark, 706-710, 7th Floor, Plot No.365/1/2, Mumbai-Pune Highway, Near New Panvel Bridge, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
22	17694055099609du9r347e	Govind Patel	SAI EVEREST BUILDERS & DEVELOPERS PRIVATE LIMITED	27ABECS7405H1Z9	\N	'+919892949416	\N	\N	\N	\N	\N	\N	\N	\N	sai.everest@gmail.com	12B, 4TH FLOOR, SILVER STRIPS CO-OP HSG SOC LTD, DATTA MANDIR ROAD, SANTACRUZ EAST, Mumbai, 400055	f	2026-04-04 21:22:26.316713	f
23	176940551140051nj44wm4	VILLA CITY BUILDERS LLP	VILLA CITY BUILDERS LLP	27AAMFV1663Q1ZB	\N	\N	\N	+91 9821297921	\N	\N	\N	\N	\N	\N	villainfra@gmail.com	Shop No. 18, Sector - 11, Shiv Chambers, Plot No. 21, C.B.D. Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
24	1769405512834jm0b84q4v	SAI TARA BUILDERS	SAI TARA BUILDERS	27ADLFS7176D1ZO	\N	\N	\N	'+919323208734	\N	\N	\N	\N	\N	\N	\N	SHOP NO 6, SHREE SAI TIRTH APT, JAIHIND COLONY, G.R. ROAD, Dombivali, 421202	f	2026-04-04 21:22:26.316713	f
25	1769405514233ko5exfvo6	Harsh Gupte	NEELKANTH ASSOCIATES	27AAHFN1044J1ZB	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	harsh.gupte99@yahoo.com	Neelkanth Landmark, 7th Floor,\r\nPlot No. 365/1/2, Mumbai - Pune Highway,\r\nBehind Orion Mall, Panvel, 410 206	f	2026-04-04 21:22:26.316713	f
26	1769405515671f18uvqrst	PLUTONIUM BUSINESS SOLUTION PRIVATE LIMITED	PLUTONIUM BUSINESS SOLUTION PRIVATE LIMITED	27AAACS7439J2ZZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	plutoniumbs@gmail.com	PLOT NO 7, TURBHE - THANE BELAPUR ROAD, BELAPUR, Navi Mumbai, 400705	f	2026-04-04 21:22:26.316713	f
27	1769405517104y04rrpivy	PRISHTI VENTURE PRIVATE LIMITED	PRISHTI VENTURE PRIVATE LIMITED	27AAFCP1845E1ZJ	\N	+917021654493	\N	\N	\N	\N	\N	\N	\N	\N	rushish0304@gmail.com	A-708, Hermes Atrium, 7th Floor, Plot No. 57, Sec-11, CBD Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
28	1769405518500v830g2pvn	JP DEVELOPERS	JP DEVELOPERS	27AAIFJ9337M1ZO	\N	'+919833983047	\N	'+919930989099	\N	\N	\N	\N	\N	\N	info@jpcorpindia.com	Office No. 6, A - Wing, JP Regency, Near Old Ambernath Village, At Pal, Ambernath (E), 421501	f	2026-04-04 21:22:26.316713	f
29	1769405519884cim5n4nfo	SHREEJI DEVELOPERS	SHREEJI DEVELOPERS	27ABRFS1096G2ZO	\N	'+919970866890	\N	\N	\N	\N	\N	\N	\N	\N	shreejicenter@gmail.com	21, Shreeji Center, Survey No. 30, Katrap Chowk, Katrap, Badlapur (E), 421503	f	2026-04-04 21:22:26.316713	f
30	1769405521269neklgai8e	SPINE CARE CLINIC	SPINE CARE CLINIC	\N	\N	\N	\N	'+91 88790 05175	\N	\N	\N	\N	\N	\N	agniveshtikoo@gmail.com	C/o DER-MED, Shop No. 5,6,7, Chamunda Serene, Sector 38, Seawood (W), Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
31	1769405522678r16l6zmcb	Parvez Mukadam	MUKADAM DEVELOPERS	27ABLFM1920F1ZE	\N	\N	\N	'+91 91195 94953	\N	\N	\N	\N	\N	\N	mukadambuilder23@gmail.com	WARD NO.15, SHOP NO.151000194, MUKADAM COMPLEX, KHED, RATNAGIRI, 415709	f	2026-04-04 21:22:26.316713	f
32	1769405524085vi0myyxtu	CRYSTAL PLAZA PREMISES SOCIETY	CRYSTAL PLAZA PREMISES SOCIETY	\N	\N	'+91 98679 21172	\N	\N	\N	\N	\N	\N	\N	\N	\N	43, 1st Floor, Hiranandani Crystal Plaza, Sec-7, Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
33	1769405525512ob7lnsdt6	TULSI GRUH NIRMAN & ASSOCIATES	TULSI GRUH NIRMAN & ASSOCIATES	27AAFFT8749Q2Z2	\N	'+91 84240 25461	\N	\N	\N	\N	\N	\N	\N	\N	info@tulsirealty.com	Mithila Nagari, Ground Floor, Opp. Police Ground, Karjat (W), 410201	f	2026-04-04 21:22:26.316713	f
273	1774940579313	Dua Builders & Developers	Dua Builders & Developers	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
34	1769405526965kry09d78m	DEEP LAXMI DEVELOPERS	DEEP LAXMI DEVELOPERS	27AAHFD4099H1Z5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	deeplaxmidevelopers1@gmail.com	21, Shreeji Center, Survey No. 30, Katrap Chowk, Katrap, Badlapur (E)	f	2026-04-04 21:22:26.316713	f
35	1769405528347ave4l2zau	RAJ LAXMI DEVELOPERS	RAJ LAXMI DEVELOPERS	27AATFR3908D1ZZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	deeplaxmidevelopers1@gmail.com	21, Shreeji Center, Survey No. 30, Katrap Chowk, Katrap, Badlapur (E), 421503	f	2026-04-04 21:22:26.316713	f
36	1769405529829mb3zinpg6	SATYAM GROUP	SATYAM GROUP	27ABVFS3198K1Z5	\N	'+919967976138	\N	\N	\N	\N	\N	\N	\N	\N	satyamgroup808@gmail.com	1007, Kamdhenu Commerz, Plot No. 02, Sector-14, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
37	1769405531217s173oddxp	SHELTER BUILDERS & DEVELOPERS	SHELTER BUILDERS & DEVELOPERS	27AADPK9377R1ZP	\N	'+919145555558	\N	'+919145555559	\N	\N	\N	\N	\N	\N	info@shelterbuilders.co.in	NL-6/9/03, Sec-15, Nerul, Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
38	1769405532603r5cjc4rgx	Irfan Dedrani	Irfan Dedrani	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
39	176940553399360642j554	VISION REALTORS	VISION REALTORS	27AATFV6770F1ZH	\N	\N	\N	'+919820534007	\N	\N	\N	\N	\N	\N	jayesh.soneta@gmail.com	Office No 1, Tulsi Appartment, Plot No 29/1A, Old Thana Naka Road, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
40	1769405535446bd3o9tjr9	SAVITRI BUILDERS AND DEVELOPER	SAVITRI BUILDERS AND DEVELOPER	27ADLFS6152R1Z5	\N	\N	\N	'+91 9833359269	\N	\N	\N	\N	\N	\N	neetapawar1212@gmail.com	Savitri Complex Plot No. 190, Sec. R5,\r\nKaranjade, Panvel, Wadhghar, Panvel, 402110	f	2026-04-04 21:22:26.316713	f
41	1769405536814e3jefoei7	IMAN ROBOTICS PRIVATE LIMITED	IMAN ROBOTICS PRIVATE LIMITED	24AAFCI4477B1ZS	\N	'+919512033557	\N	\N	\N	\N	\N	\N	\N	\N	imanrobotics03@gmail.com	D-301, Blue Sector, Pashawnath Atalntis Park, Sughad, Gandhi Nagar, Gujarat, 382424	f	2026-04-04 21:22:26.316713	f
42	1769405538173trh9gmlix	Mushtaque Ismail Dabhilkar	Mushtaque Ismail Dabhilkar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
43	1769405539547q89vpsa9m	Unicorn Seafoods	Unicorn Seafoods	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
44	1769405541097mqrxvba3n	ANSARI BROTHERS INFRA PRIVATE LIMITED	ANSARI BROTHERS INFRA PRIVATE LIMITED	27AAKCA3370L1ZE	\N	\N	\N	'+91 91583 37908	\N	\N	\N	\N	\N	\N	\N	342, ROOM NO. 53,54, 2ND FLOOR, KALBADEVI ROAD,, KALBADEVI, Mumbai, 400002	f	2026-04-04 21:22:26.316713	f
45	17694055424880h26wzn57	Padmavati Builders	Padmavati Builders	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
46	1769405543964bziod6ixt	Bhavesh Patel Citi	Vision Infratech - Bhavesh	\N	\N	+91 88661 11133	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
47	1769405545365bnflhzs6r	KAVERI ENTERPRISES	KAVERI ENTERPRISES	27AJCPK9776C1ZZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	kaverienterprises2006@gmail.com	Shop No. 5, Balaji Swaroop, Plot No. 32, Sector-19, Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
48	1769405546754hvzbmpgdg	Deepak Thakare	VISTAR ARCHITECTS & PLANNERS	27AADFV9086G1ZO	\N	'+912227580241	\N	\N	\N	\N	\N	\N	\N	\N	accounts@vistaararch.com	Shree Nand Dham, A-505 / 506, Plot No. 59, Sec-11, CBD-Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
49	1769405548244wlymgszo3	Arif Patel	RIO INFRATECH	27AAZFR3655B1ZT	\N	\N	\N	'+919821636789	\N	\N	\N	\N	\N	\N	rioinfratech111@gmail.com	Plot No. 9, Sector 7, Taloja Phase-1, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
50	17694055496648y8bhf5zm	Ashfaque Khan	CEMCON DEVELOPERS	27AAHFC8833E1ZE	\N	'+919819435797	\N	\N	\N	\N	\N	\N	\N	\N	innovativeconsco@yahoo.com	Innovative Palace, 03, Plot No. 157, Sec-44, Nerul,, Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
51	1769405551066cdddt8x1s	Rakesh Pote	VASTU SHILP CONSTRUCTION	27AYXPP1166B1Z5	\N	\N	\N	'+91 76667 79777	\N	\N	\N	\N	\N	\N	vastushilp7779@gmail.com	Shop No. 07, Shree Krushna Kutir Apt., Momin Pada, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
52	1769405552536b0zhxiszu	Niraj Gala	SHREE SHAKTI DEVELOPERS	27ABWFS2964A1ZT	\N	\N	\N	'+919820515655	\N	\N	\N	\N	\N	\N	nirajgala@hotmail.com	Shree Shakti Destiny, Khardi Davale, Diva Shil Road, Diva (East), Thane, 400612	f	2026-04-04 21:22:26.316713	f
53	1769405553898uhm150opb	Darshan Singh	Kshipra Realty	27AAVFK4399R1ZW	\N	\N	\N	'+919930281381	\N	\N	\N	\N	\N	\N	darshansingh2805@gmail.com	Shop No. 6, Yashodeep CHS, Plot No. 53, Sector 4A, Koperkhairne, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
54	1769405555281ukrqvcitj	Wisdom Woods - Vicky Shinde	Wisdom Woods - Vicky Shinde	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
55	1769405557701xhh1n5kum	Bharat Patel	MILLENIUM REALTORS	27ABCFM9965F1ZU	\N	+91 9322949805	\N	\N	\N	\N	\N	\N	\N	\N	milleniumrealtors11@gmail.com	PLOT NO.66A, OFFICE NO 211, CONCORDE, SECTOR 11,,\r\nCBD BELAPUR,, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
56	17694055594275g0uqwqv2	BHANUDAS DASHARATH PATIL	SHREE DATTATREY ENTERPRISES	27BUSPP0632A1ZQ	\N	'+919324591918	\N	'+919821712891	\N	\N	\N	\N	\N	\N	shreedattatray024@gmail.com	Building No. A1, R. No. 04, Ground Floor, Om Sai Park, Juna Pada, Near Balmitra Mandal Vyayam Shala, Kalher, Thane	f	2026-04-04 21:22:26.316713	f
57	1769405560964z51tm0enf	Kamruzzaman	VESUVIUS INDIA LIMITED	27AAACV8995Q2Z3	\N	\N	\N	'+919390555768	\N	\N	\N	\N	\N	\N	kamruz.zaman@vesuvius.com	Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
58	176940556233412tscnqge	SHREEJI LIFESPACES BUILDCON	SHREEJI LIFESPACES BUILDCON	27AELFS6248H1ZJ	\N	9082616931	\N	\N	\N	\N	\N	\N	\N	\N	shreejigroup02@gmail.com	Office No. 103, B-Wing, The Great Eastern Summit, Plot No. 66, Sector 15, \r\nCBD Belapur,, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
59	1769405563701rj1537ynd	Arif Punjabi	FASCINATE ARCHITECTS	27AABFF2376F1ZL	\N	\N	\N	'+919820078946	\N	\N	\N	\N	\N	\N	fascinate_architects@yahoo.com	F-4, Neighbourhood Shopping Premises, Plot 10/11, Sec-4, Nerul,, Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
60	1769405565100g68710nt6	Patel Galaxy CHS Ltd.	Patel Galaxy CHS Ltd.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Plot 98, Sec-20, Ulwe,, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
61	1769405566856rj0n7polv	Grish  Kasat	OLIVE ENTERPRISES	27AAAAO8329B1ZQ	\N	+912227452321	\N	'+919833648242	\N	\N	\N	\N	\N	\N	kasatg@yahoo.com	Ground Floor, Kapad Bazar, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
62	1769405568240bbezxk7ys	NEXUS GROUP	NEXUS GROUP	27AAQFN8342J1ZN	\N	'+919320442828	\N	\N	\N	\N	\N	\N	\N	\N	ganesh.tawre2298@gmail.com	Survey No. 6/H. No. 7/A, At Khardigaon,Diva Shil Road, Post Dawle,, Thane, 400612	f	2026-04-04 21:22:26.316713	f
63	1769405569625y4rtr3ex6	Nizam Shaikh	Al-Ifrah International	\N	\N	+918879060260	\N	\N	\N	\N	\N	\N	\N	\N	alifrahinternational@gmail.com	102/A Dost Apt, Above Kohinoor Electronics, Opp. Noorani Hotel, Kausa Mumbra, Thane, Maharashtra, 400612	f	2026-04-04 21:22:26.316713	f
64	176940557102469jsl64ev	SHIV SHAKTI HOMES	SHIV SHAKTI HOMES	27AEOFS6716H1ZJ	\N	'+919920099180	\N	\N	\N	\N	\N	\N	\N	\N	pokarmohan@gmail.com	A-Wing, Shivshakti Oasis,\r\nSurvey No. 71/5, Shirgaon,, Badlapur(E), 421503	f	2026-04-04 21:22:26.316713	f
65	1769405572433xb0cjlmpc	BASIL REALTY & INFRA SOLUTION LLP	BASIL REALTY & INFRA SOLUTION LLP	27AAUFB9519P1ZE	\N	'+919320555560	\N	\N	\N	\N	\N	\N	\N	\N	nilesh@basilrealty.in	107, Monarch Plaza, First Floor, Plot No. 56, Sector 11, CBD Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
66	1769405573814xd7nvr8jc	Roshan Patil	D P CONSTRUCTIONS	27AAGFD2173F1ZN	\N	'+912227560071	\N	'+91 97687 07171	\N	\N	\N	\N	\N	\N	dpconstructions71@yahoo.co.in	\N	f	2026-04-04 21:22:26.316713	f
67	1769405575208r5tlntzj8	Jankhana Soneta	REKREATE KITCHENS AND MORE	27ABCFR1117L1Z8	\N	'+912227482936	\N	'+918433917979	\N	\N	\N	\N	\N	\N	jankhana.soneta@gmail.com	Shop No. 12/13, Shivaji Market, Plot No. 8/9, Near APMC Police Station, Sector-19D, Vashi, Navi Mumbai, 400705	f	2026-04-04 21:22:26.316713	f
68	1769405576581nl1ot782i	UNITY INFRA	UNITY INFRA	27AAGFU9561N1ZB	\N	'+919920755501	\N	\N	\N	\N	\N	\N	\N	\N	synergyconstruct88@gmail.com	A-604, Satyam Prime CHS, Ganesh Ghat, Katrap, Badlapur (E), 421503	f	2026-04-04 21:22:26.316713	f
69	1769405578095ec4dbg6t0	DenEB Air Gases Private Limited	DenEB Air Gases Private Limited	27AAECD6735C1ZT	\N	+912227570596	\N	\N	\N	\N	\N	\N	\N	\N	Sheetal@denebsolutions.com	A-605, Mahavir Icon, Plot No.89, Sector 15,\r\nCBD Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
70	176940557951990lar553v	NEELKANTH HI-TECH INFRA	NEELKANTH HI-TECH INFRA	27AAQFN0706Q1ZP	\N	'+918169898356	\N	\N	\N	\N	\N	\N	\N	\N	hitech270918@gmail.com	905, MAYURESH CHAMBERS, PLOT NO. 60, SECTOR 11, CBD BELAPUR, NAVI MUMBAI, 400614	f	2026-04-04 21:22:26.316713	f
71	17694055809328zbj4k5nd	Rizwan Hamdule	MILESTONE TRADERS	27ABPFM1459B1Z8	\N	+919029088814	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shop No. 5, N.S. View, Plot 147/148, Sector 10, Taloja Phase-1,, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
72	1769405582484e0y8mfpdg	Bhujang Mundhe	NEXTGEN MAPPING	\N	\N	\N	\N	'+917738671260	\N	\N	\N	\N	\N	\N	bj.mundhe@gmail.com	Shop No. 23, Shelter Plaza, Plot No. 53,\r\nSector 50 (Old), Nerul (Seawoods),, Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
73	1769405584003jseghzb84	NANDDEEP COOPERATEVE HOUSING SOCIETY LTD	NANDDEEP COOPERATEVE HOUSING SOCIETY LTD	27AACAN4167A1ZV	\N	+9199302430211	\N	+919930113930	\N	\N	\N	\N	\N	\N	nanddeepchsl@gmail.com	Shradhanand Road, Vile Parle (E), Mumbai, 400057	f	2026-04-04 21:22:26.316713	f
74	1769405585436y2j43lrpa	VILAS MADANLAL KOTHARI	NEEL BUILDERS AND DEVELOPERS	27ACHPK9935F1ZA	\N	+912227454046	\N	\N	\N	\N	\N	\N	\N	\N	neelbuilders@gmail.com	1ST FLOOR, NEEL AVENUE, PLOT NO 05, SECTOR-19, NEW PANVEL,, NAVI MUMBAI, 410206	f	2026-04-04 21:22:26.316713	f
75	17694055868714y3e2r8io	Ratish Shetty	UNIQUE ASSOCIATES	27ABFFM5521Q1ZS	\N	\N	\N	'+919920859257	\N	\N	\N	\N	\N	\N	\N	Office No. 39 & 40, 1st Floor, Crystal Plaza (Hiranandani), Sector-7, Kharghar,, Navi Mumbai, 410 210	f	2026-04-04 21:22:26.316713	f
76	17694055882683m2tsug10	Umesh Patel	LAXMI GLOBAL	27AAFFL6998P1Z6	\N	'+912227744812	\N	'+918655299771	\N	\N	\N	\N	\N	\N	laxmigroup7@gmail.com	#511, The Landmark, Plot No. 26/A, Sector-7, Near Hotel Three Star, Kharghar,, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
77	1769405589738tji787j1a	Ashiyan  Khot	Ashiyana Dream Homes Private Limited	27AANCA9050G1ZH	\N	'+919987603232	\N	\N	\N	\N	\N	\N	\N	\N	admin@ashiyanadreamhomes.com	Ashiyana Dream Homes Pvt. Ltd.\r\n106 to 109, R. K. Tower, Bazarpeth, Khopoli, 410203	f	2026-04-04 21:22:26.316713	f
78	1769405591171sbee4ej0i	Karanti  Pasange	MAULI INFOTECH (OPC) PRIVATE LIMITED	27AAKCM0491N1ZY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	kranti.pasange@mauli-infotech.co.in	Office No. 409, Niharika Mirage, Plot No. 274, Sec - 10, Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
79	1769405592541ad6z6jq8h	Amaan Patel	ROYAL ENTERPRISES	27AAUFR5670D2ZQ	\N	\N	\N	'+919920403640	\N	\N	\N	\N	\N	\N	nouman9920@gmail.com	Plot No. 20, Adarsh CHS Ltd., Panvel, Dist Raigadg, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
80	1769405593928njiigwl4d	Majid  Patel	QASWA BLOCKS MFG LLP	27AABFQ0615J1ZF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	majidjp2211@gmail.com	Shop No.07/08, Laxmi Angan CHS , Plot No.07, Sector 34A Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
81	17694055953699gonpmhk8	Rohan B. Gholap	Dr. Gholap's Dental & Cosmetic Clinic	\N	\N	'+918928146949	\N	'+919768374461	\N	\N	\N	\N	\N	\N	dr.gholapclinic@gmail.com	Bhagwati Imperia, Shop No.22, Plot 1, Sector 9, Ulwe,, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
82	1769405596743k4327u6eh	Prashant  Thakur	KVK HOMES	27AANFK5936E1Z2	\N	+917666821111	\N	+919819109000	\N	\N	\N	\N	\N	\N	kvksaless@gmail.com	S-2, KVK, Durvankur, Plot No.17, Rd.No.17, Sector 19, New Panvel (E),, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
83	17694055982048pdeuinbn	Manish  Gilda	KAMAL DEVELOPERS	27AAOFK5821D1ZB	\N	'+919920582333	\N	\N	\N	\N	\N	\N	\N	\N	kamaldevelopers105@gmail.com	2ND FLOOR, FLAT NO 4, MUNOT ELITE, PLOT NO. 367, TILAK ROAD,, PANVEL, 410206	f	2026-04-04 21:22:26.316713	f
84	17694055996718y47xnj85	Dwijen Mehta	LIFE SPACE BUILDERS LLP	\N	\N	'+912221026401	\N	\N	\N	\N	\N	\N	\N	\N	lifespacebuildersllp@gmail.com	504, Sai Heritage, Tilak Road, Ghatkopar East,, Mumbai, 400077	f	2026-04-04 21:22:26.316713	f
85	17694056011055y2kzeth3	Ishaque Shaikh	Laxmi Builders Builders & Developers	\N	\N	\N	\N	'+919322659632	\N	\N	\N	\N	\N	\N	\N	Shop No. 14, Piyush Majestic, Diva-Shil Road, Near Nirmal Nagari, Diva (E, Thane, 400612	f	2026-04-04 21:22:26.316713	f
86	1769405602539jny0cd41j	Fakhruddin  Khan	SIEMAC ENGINEERS	27ARHPK5771E1ZN	\N	\N	\N	'+919892539413	\N	\N	\N	\N	\N	\N	siemacengineers@yahoo.co.in	Gala No 4. Ram Rahim Udyog Nagar, Dargah Cross Road, Sonapur, Bhandup, Mumbai, 400078	f	2026-04-04 21:22:26.316713	f
87	17694056039608948q1v89	SUNRISE REALTORS	SUNRISE REALTORS	27ADPFS7361E1ZN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	GROUND FLOOR, HOUSE NO. 1473, SUNCITY, KAMATGHAR, OPP SHANKAR DYEING, BHIWANDI, 421302	f	2026-04-04 21:22:26.316713	f
88	1769405605407r03xqxxvz	Dinesh Kasat	V R BUILDERS	27AAEFV5393D1ZZ	\N	'+912227894984	\N	'+919930263501	\N	\N	\N	\N	\N	\N	vrgroup@hotmail.com	Office No. 706, 7th Floor, 4,5,6, Fairmount Apartment, Sector-17, Palm Beach Road, Moraj Residency, Sanpada,, Navi Mumbai, Maharashtra, 400705	f	2026-04-04 21:22:26.316713	f
89	1769405606841ab1spyktv	Wajid Shaikh	WELKIN DEVELOPERS	27AABFW9835C1Z0	\N	\N	\N	'+919769468897	\N	\N	\N	\N	\N	\N	welkindevelopers@yahoo.in	507-508, Satra Plaza, 5th Floor, Plot No. 19 & 20, Palm Beach Road, Sector 19D, Vashi, Navi Mumbai, 400703	f	2026-04-04 21:22:26.316713	f
90	1769405608237fftlvq9os	Nirav Patel	SHIVSHAKTI DEVELOPERS	27ADPFS6240N1ZC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9, SUN VILLA APARTMENT, NEAR UNION BANK, AMBERNATH-BADLAPUR ROAD BELAVALI, BADLAPUR WEST, Thane, 421503	f	2026-04-04 21:22:26.316713	f
91	17694056096940tgmqms5d	Irfan Mulla	Irfan Mulla	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
92	1769405611143axl9sfpdw	Kiran Bagad	OMKARA ENTERPRISES	27AAGFO2277F1Z7	\N	'+919967020931	\N	'+919820154507	\N	\N	\N	\N	\N	\N	omkaraenterprises2018@gmail.com	Survey No. 43/1, 43/4, Koynavele, Ghot Camp, Near Taloja Phase-II,, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
93	1769405612541mfwneq9om	Deepak Thakare	DEEPAK PANDURANG THAKARE	27ABYPT8227D1ZZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shree Nand Dham, A-505 / 506, Plot No. 59, Sec-11, CBD-Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
94	1769405614010u6nnw6dgp	Mohan Pokar	SHIVSHAKTI GENESIS	27AEOFS6716H1ZJ	\N	'+919920099180	\N	\N	\N	\N	\N	\N	\N	\N	pokarmohan@gmail.com	Survey No. 71/5, Shirgaon, Badlapur (E), Thane, 421503	f	2026-04-04 21:22:26.316713	f
95	1769405615371deodz3cg5	Mohan Pokar	SHIVSHAKTI BUILDCON	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	shivshaktibuildcon.prime@gmail.com	9, Sun Villa, Ambernath Badlapur Road, Near Union Bank, Badlapur (W), Thane, 421503	f	2026-04-04 21:22:26.316713	f
96	1769405616778yi2ixpic3	Shailendra S. Bhostekar	SHAILENDRA S BHOSTEKAR & ASSOCIATES/SAIRAJ FINANCIAL CONSULTANCY SERVICES	27AFFPB1075G1ZU	\N	+912513504100	\N	'+919860767555	\N	\N	\N	\N	\N	\N	sairajfinancial@gmail.com	Shop No. 2 & 3, Sairaj Apartment, Near Thackray Garden, MIDC Road,, BADLAPUR (W), 421305	f	2026-04-04 21:22:26.316713	f
97	1769405618141b89tm03rq	Ziyad Kazi	H S Construction	27AAMFH3159B1ZH	\N	\N	\N	'+918879597212	\N	\N	\N	\N	\N	\N	hsconstruction394@gmail.com	Plot No. 487, Marketyard, Old Panvel, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
98	1769405619643jp570hhwa	Prashant Thakur	Neel Realtors	27AALFN4934H1ZZ	\N	\N	\N	'+91981909000	\N	\N	\N	\N	\N	\N	thakur.7474@gmail.com	1st Floor Neel Avenue, Above ICICI Bank, Plot No. 05, Panvel-Matheran Road,, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
99	1769405621000jhvn374z7	Siddharth Rao	Space Designers	27AAOPW4922H1Z6	\N	'+919272731950	\N	\N	\N	\N	\N	\N	\N	\N	space4482@gmail.com	001, Shiv-Aditya CHS. Sarvodaya Nagar, Manjarli Road, Kulgaon, Badlapur, Maharashtra, 421504	f	2026-04-04 21:22:26.316713	f
100	1769405622349tfgho9i5j	Kamlesh Patel	Shubh Enterprises	27ABZFS7514F1ZK	\N	'+919892445881	\N	\N	\N	\N	\N	\N	\N	\N	shubh_enterprises@ymail.com	Plot No. 79,80,93,94, Sector 08, New Panvel, 410206	f	2026-04-04 21:22:26.316713	f
101	1769405623882w0ni48kf2	Faizan Ahmed	MMANTC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Mansoorah, Malegaon	f	2026-04-04 21:22:26.316713	f
102	1769405625257dgqo6wju9	Jay Lakhani	RSMART AVIATION SOFTWARE PRIVATE LIMITED	27AAICR2964H1Z2	\N	'+918779524314	\N	\N	\N	\N	\N	\N	\N	\N	jay@rsmart.fi	406, Zion Mahaveer, kopra Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
103	1769405626679vktgl4qxi	Wasim Patel	Armaan Enterprises	\N	\N	'+919702804943	\N	\N	\N	\N	\N	\N	\N	\N	armaanp7861@gmail.com	Arman Residency, Plot No. C6, Sector 35G, Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
104	17694056281961in4scay9	Shafique Bhatkar	OMKAR ENTERPRISES	27AABFO6911F1ZF	\N	+919820638932	\N	\N	\N	\N	\N	\N	\N	\N	shafiquebhatkar@gmail.com	Shop No. 17, Meridian Apartments, Sec-6, Nerul (W), Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
105	17694056295721xo4f0pp6	Shelter Park CHS Ltd.	Shelter Park CHS Ltd.	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shelter Park, Plot No. 207-209, Sector-10, Kharghar,, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
106	1769405631010anfybyu0r	KAMAL INFRASTRUCTURE	KAMAL INFRASTRUCTURE	27ADZPG0767G1Z4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1 & 2, Shree Sai Krupa CHS, Plot No. 64, MCCH Society, Panvel, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
107	1769405632397nabaajy9r	Nikhil	SAI KRUPA DEVELOPERS	27ABSFS4091C2ZU	\N	\N	\N	'+919820256770	\N	\N	\N	\N	\N	\N	\N	Shop No. 1 & 2, Magnum Apartment, Plot No. 11 - A, Sector-11, Vijay Marg,, New Panvel (E), Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
108	1769405633877dczcnrgn6	Jitendra Sachdev	J S Legal Advocates	\N	\N	'+919819013200	\N	\N	\N	\N	\N	\N	\N	\N	jsk@jslegal9.com	1805, FAIRMOUNT, Plot No. 4 & 6, Sector-17, Off. Palm Beach Road, Sanpada,, Navi Mumbai, Maharashtra, 400705	f	2026-04-04 21:22:26.316713	f
109	1769405635310bla2fjamp	Swapnil Kalyankar	Namaha Infra	27BFMPK2686C2Z9	\N	+919987596001	\N	+919594740000	\N	\N	\N	\N	\N	\N	namahainfra@gmail.com	A-101, Neel Emarald, Final Plot No. 527 B,Sai Nagar Road, Near Tahsildar Office,, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
110	1769405636744jk1w79wvz	MANA ELECTRIC & ENGINEERING SERVICES	MANA ELECTRIC & ENGINEERING SERVICES	27ABQPT3405K1Z6	\N	+912512693222	\N	+917719907222	\N	\N	\N	\N	\N	\N	manaelectric@gmail.com	Shop No.1,2 & 3, "Sai-Pratibha" Apartment,¬†\r\nBesides Khatri Construction, Ramnagar,¬†\r\nShirgaon, Aptewadi, Badlapur(East),, Thane, 421503	f	2026-04-04 21:22:26.316713	f
111	17694056382387de84rz4l	Swapnil Kalyankar	NAMAH CONSTRUCTION	27BFMPK2686C2Z9	\N	+919987596001	\N	+919594740000	\N	\N	\N	\N	\N	\N	namahainfra@gmail.com	A-101, Neel Emarald, Final Plot No. 527 B,Sai Nagar Road, Near Tahsildar Office,, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
112	17694056396759rdxlr86q	Mansukh Patel	Unnati Sheltors	\N	\N	'+917021110676	\N	'+919820499008	\N	\N	\N	\N	\N	\N	unnati100@gmail.com	Plot No. 41F, Sector-07, Pushpak Nagar, Dapoli,, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
113	1769405641251bwkmlyvcd	PANCHVATI FOODS	PANCHVATI FOODS	24AANFP2798P1ZA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	info@panchavatifoods.com	SURVEY NO. 181/1, Haripara Road, Mahuva,, Bhavnagar, Gujarat, 364290	f	2026-04-04 21:22:26.316713	f
114	1769405642727bprcdjeij	Aslam Shaikh	SWIMWELL POOLS INDIA PRIVATE LIMITED	27AAZCS1228C1Z7	\N	'+918899002000	\N	'+919930984063	\N	\N	\N	\N	\N	\N	sales@swimwell.co.in	5 & 6, City Arcade, Near Arif Compound, Panvel-Mumbra Road, Mumbra Dahisar Naka,, Thane, 400612	f	2026-04-04 21:22:26.316713	f
115	1769405644311wduorixo5	Dhaval Patel	SHRUSHTI CREATORS	27AERFS4205E1ZY	\N	\N	\N	'+919699035005	\N	\N	\N	\N	\N	\N	shrushtidevelopers15@gmail.com	SURVEY NO-105A,H.NO-4/1, \r\nAT-BELAVALI, BADLAPUR WEST,, THANE, 421503	f	2026-04-04 21:22:26.316713	f
116	17694056458582ntay93uz	Akif Hurzuk	AQDAS DESIGNS	27CMVPK0174Q1Z5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	B-1101, Shelter Park, Sector-10, Kharghar, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
117	17694056472399em3w3pgz	Sheetal Sharma	DENEB SOLUTIONS	27AAGFD2453A1ZY	\N	'+91227570596	\N	\N	\N	\N	\N	\N	\N	\N	Sheetal@denebsolutions.com	A-605,¬†Mahavir¬†Icon,  \r\nPlot No.89, Sector 15,\r\nCBD Belapur, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
118	17694056490959ggguisut	Rahul Dedhia	AAGAM BUILDTECH	27ABEFA2689N1ZW	\N	\N	\N	'+919833669987	\N	\N	\N	\N	\N	\N	rahul@saranggroup.in	SAI ARCADE BUILD PLOT NO 184, OFFICE NO 222, NEAR\r\nLIFE LINE HOSPITAL, OPP. PANVEL S.T. BUS STAND, OLD\r\nPANVEL, RAIGAD, 410206	f	2026-04-04 21:22:26.316713	f
119	1769405650541xduowke6w	Sanjay Patel	AAKAR CONSTRUCTION	27ABVFA1683K1ZT	\N	\N	\N	'+918779685474	\N	\N	\N	\N	\N	\N	aakarconstruction146@gmail.com	36, Hari Om Heritage, Plot No. 8, Sector-21, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
120	1769405652003d7ygfq0fy	Mehul Chawda	NAKKSHATRA PRIME REALTORS PRIVATE LIMITED	27AAHCN8556C1Z9	\N	\N	\N	'+91 97699 11219	\N	\N	\N	\N	\N	\N	\N	GNP GALLERIA, UNIT NO. 15, SECOND FLOOR, KALYAN HIGHWAY, DOMBIVLI, Maharashtra, 421203	f	2026-04-04 21:22:26.316713	f
121	1769405653442kl625vxlf	Amir Hamduley	HD BUILDERS & DEVELOPERS	27AAMFH7713B1ZH	\N	\N	\N	'+91 98702 82029	\N	\N	\N	\N	\N	\N	\N	Shop No. 5, N S View, Sector-10, Taloja Phase-1,, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
122	1769405654871x7dhe6ilj	Pramod Patil	MARUTI CONSTRUCTION	27AAZFM2483L1ZD	\N	'+912227560071	\N	+919768907171	\N	\N	\N	\N	\N	\N	dpconstructions71@gmail.com	Office No. 707, Shelton Cubix, Plot No. 87, Sector 15, CBD Belapur,, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
123	176940565629545pqzvgwy	Prathamesh Bhoir	SHREE GANESH BUILDCON	\N	\N	'+9198220 85744	\N	\N	\N	\N	\N	\N	\N	\N	shreeganeshbuildcon4100@gmail.com	Chatrapati Shivaji Maharaj Chowk, Main Highway Vangani.	f	2026-04-04 21:22:26.316713	f
124	17694056579512kktsssow	SATYAM INFRACON PRIVATE LIMITED	SATYAM INFRACON PRIVATE LIMITED	27AAMCS4391P2ZE	\N	\N	\N	'+919967976138	\N	\N	\N	\N	\N	\N	satyamgroup808@gmail.com	1107, Kamdhenu Commerz, Plot No. 02, Sector 14, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
125	1769405659376qfdsb2e2r	Shashikant Roy	ROY ENTERPRISES	27AKKPR4386A1ZY	\N	\N	\N	'+919967976138	\N	\N	\N	\N	\N	\N	royenterprises808@gmail.com	Satyam Heights, Plot No. 81, Sector-19, Kamothe,, Navi Mumbai, 410209	f	2026-04-04 21:22:26.316713	f
126	1769405660912k30ug3s51	Shashikant Roya	ROY CONSTRUCTIONS	\N	\N	'+919967976138	\N	\N	\N	\N	\N	\N	\N	\N	royenterprises808@gmail.com	Satyam Heights, Plot No. 81, Sector-19, Kamothe,, Navi Mumbai, 410209	f	2026-04-04 21:22:26.316713	f
127	1769405662311z1bwcc75q	Binita Ganatra	VKREATE KITCHENS	27AAPFV7069P1ZY	\N	'+919833417676	\N	\N	\N	\N	\N	\N	\N	\N	vkreatekitchens@gmail.com	Shop No. 2, Sai Darshan CHS, Opp. Sai Baba Temple, Sonarpada, Kalyan Shil Road,, Dombivali, Maharashtra, 421204	f	2026-04-04 21:22:26.316713	f
128	17694056637973u2moshmb	OMEGA ENTERPRISES	OMEGA ENTERPRISES	27ACHPK9868R1ZD	\N	\N	\N	+919820198242	\N	\N	\N	\N	\N	\N	kasatg@yahoo.com	61/1, Susheel House, Opp. HOC Colony, Old Thana Naka Road, Panvel, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
129	1769405665310dxjilycqb	Hiten Mewani	MEWANII DEVELOPER	27AAWFM0543N1ZN	\N	+919860667744	\N	\N	\N	\N	\N	\N	\N	\N	ganesha.construction@gmail.com	1004, 10th Floor, Satra Plaza, Plot No - 20, Sector 19D, Palm Beach Road, Vashi,, Navi Mumbai, 400703	f	2026-04-04 21:22:26.316713	f
130	176940566685099hmvbmnh	3EV INDUSTRIES PRIVATE LIMITED	3EV INDUSTRIES PRIVATE LIMITED	29AABCZ3600R1ZT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	shivkumar@3evi.com	\N	f	2026-04-04 21:22:26.316713	f
131	176940566823341yiatb1q	Manish Gilda	PRIYAL PROPERTIES	27AAIFP5705H1Z5	\N	\N	\N	+919768730330	\N	\N	\N	\N	\N	\N	manishjgilda@gmail.com	Shop No. 1 & 2, Shree Sai Krupa CHS, Plot No. 64, MCCH Society, Near Gandhi Nagar Hospital,, Panvel, 410206	f	2026-04-04 21:22:26.316713	f
132	1769405669653oi5zv4tq0	ABRI REALTY	ABRI REALTY	27CFWPK9736E1ZQ	\N	'+919619620277	\N	'+919821064874	\N	\N	\N	\N	\N	\N	abrirealty@gmail.com	F-2, Shop No. 1, Sector-15, Nerul,, Navi Mumbai, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
133	17694056711524dp3md58n	SOGENIX PHARMA LLP	SOGENIX PHARMA LLP	27ACUFS8383C1ZG	\N	+912249733035	\N	\N	\N	\N	\N	\N	\N	\N	sogenix.pharma@gmail.com	NO. 71, MARUTI PARADISE CHS LTD., PLOT NO. 93-95, SECTOR-15, CBD-BELAPUR,, NAVI MUMBAI, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
134	176940567258792p6vt2yv	Sudhir Tatkare	Ahilya Enterprises	\N	\N	\N	\N	'+91 98207 25931	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
135	1769405673965yiluzdbn1	Nirav Patel	SHIVSHAKTI ENTERPRISES	27AEQFS1658N1Z5	\N	\N	\N	'+91 98207 09303	\N	\N	\N	\N	\N	\N	\N	Ground Floor, Sun Vills G9, Soan Villa, Lal Bahadur Shastri Marg, Siddhivinayak Motors, Sai Gaon Belavali, Badlapur,, Thane, 421503	f	2026-04-04 21:22:26.316713	f
136	1769405675429j6w54rm7e	Rushish Timbadia	PRISHTI VENTURE PRIVATE LIMITED - Avyukta	27AAFCP1845E2ZI	\N	\N	\N	+91 98334 94900	\N	\N	\N	\N	\N	\N	prishtigroup@gmail.com	Krishna Valley, Plot No. 19/2719, Near Zenith Waterfalls, Khopoli Road, Khopoli, Khalapur, Maharashtra, 410202	f	2026-04-04 21:22:26.316713	f
137	1769405676797tvzaftvjl	Jitesh Thakkar	LEELA ASSOCIATES	27AAHFL5412E1ZK	\N	\N	\N	'+919822840010	\N	\N	\N	\N	\N	\N	\N	Shop No. 01, Near Gagangiri Maharaj Ashram, Opp. Shankar Mandir,, Khopoli, 410203	f	2026-04-04 21:22:26.316713	f
138	1769405678304g94imztkj	Pradeep Bhandari	VEENDEEP OILTEK EXPORTS PVT.LTD.	27AAECG0218M1ZN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	info@veendeep.com	Plot No. N-16/17/18, Additional MIDC Patalganga,, Raigad, 410207	f	2026-04-04 21:22:26.316713	f
139	1769405679718rel3hylr5	UNIQUE ASSOCIATES	UNIQUE ASSOCIATES	27AHYPS4269C2ZN	\N	\N	\N	+919920859257	\N	\N	\N	\N	\N	\N	rdshetty11@yahoo.com	Office No. 909, 9th Floor, The Landmark CHS Ltd., Plot No. 26A, Sector-7, Kharghar,, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
140	1769405681188dv5lq0ef7	Mr. Ajaz Khan	INNOVATIVE CONSTRUCTION COMPANY	27AACFI3509G1ZM	\N	\N	\N	+919819354988	\N	\N	\N	\N	\N	\N	innovativeconsco@yahoo.com	Innovative Palace, Shop No. 1,2 & 3, Plot No. 157, Sector - 44, Nerul, Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
141	1769405682594k91323ly3	Saud Mulla	CONCRETE DEVELOPERS	27AAPFC1786L1ZT	\N	\N	\N	+917208822224	\N	\N	\N	\N	\N	\N	mukadamsaud@gmail.com	B-1601, PLOT NO.207/208/209, SECTOR-10 KHARGHAR,, NAVI MUMBAI, 410210	f	2026-04-04 21:22:26.316713	f
142	1769405684024ujhp2nq62	Manish Gilda	KAMAL ENTERPRISE	27AAUFK9241R1Z6	\N	\N	\N	+9197687 30330	\N	\N	\N	\N	\N	\N	manishjgilda@gmail.com	MCCH Society, GROUND FLOOR, Plot no. 64, Shop No. 1 & 2, Sree\r\nSai Kripa Apartment, Late Appa Saheb Vedak Marg, Old Panvel,, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
143	1769405685590t9pwnny8d	Arif Patel	INFINITY DEVELOPERS	27AKQPP0681E2ZV	\N	\N	\N	'+919821636789	\N	\N	\N	\N	\N	\N	\N	Metro Corner, Plot No. 13, Sector 12, Taloja Phase - 1,, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
144	1769405687024epljtd7lf	Vishal Chaudhary	PLATINUM ENTERPRISE	27AALFP9671P1Z4	\N	\N	\N	+919930101100	\N	\N	\N	\N	\N	\N	\N	703, J.K. Chambers, Plot No. 76, Sec-17, Vashi, Navi Mumbai, 400705	f	2026-04-04 21:22:26.316713	f
145	1769405688560kl26mcxru	Sandeep Pal	NESTGURU REALTORS PRIVATE LIMITED	27AAHCN1599D2Z9	\N	'+91 99306 53303	\N	\N	\N	\N	\N	\N	\N	\N	billing@nestguru.in	Ground Floor, Shop No. 24 Plot No. 166, Sector 9, Ulwe Panvel, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
146	17694056899977qlor2w7o	Tarique Qazi	GALAXY DEVELOPERS	27AZXPK0364M2ZM	\N	\N	\N	'+919082837917	\N	\N	\N	\N	\N	\N	galaxydeveloperstaloja@gmail.com	Ground Floor, Tarique Heritage, Plot 39, Sector 10, Taloja-I,, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
147	1769405691429wq5nzqsh6	Bharat Patel	BHOOMI KALASH GROUP	27AAZFB3859M1ZG	\N	\N	\N	+919920453300	\N	\N	\N	\N	\N	\N	bnpbhoomigroup@gmail.com	Kalash Greens, Gat No. 99/2, 99/3, Giravale Village, Panvel, Maharashtra, 410221	f	2026-04-04 21:22:26.316713	f
148	176940569279926752rzy6	Himanshu Agarwal	ANNAM GLOBAL PRIVATE LIMITED	27AAACB8823H1ZO	\N	\N	\N	+918078641228	\N	\N	\N	\N	\N	\N	info@annam.group	508, Shelton Cubix, Plot No. 87, Sector 15, CBD Belapur,, Navi Mumbai, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
149	1769405694235lteqxqqgk	S P CONSTRUCTION	S P CONSTRUCTION	27AAHFS9101K2ZX	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	info@spconstruction.net	1, Crystal CHS, Opp. Axis Bank, Plot 25, Sector 19, Matheran Road, New Panvel (E),, Navi Mumbai, 410206	f	2026-04-04 21:22:26.316713	f
150	1769405695625nac4t1roc	Vikas Benke	ROYAL DEVELOPERS	27AAOFR7533D1ZZ	\N	\N	\N	+919022777040	\N	\N	\N	\N	\N	\N	vikas.benke@gmail.com	Shop No. 10, Shanti Park CHS. Plot No. B-111/112, Sec-23, Nerul (E), Navi Mumbai, 400706	f	2026-04-04 21:22:26.316713	f
151	1769405697000ss8ac75ks	Santosh Kumar	RUDRA ENTERPRISES	27EBZPK4654L1ZN	\N	8433547218	\N	+919820531894	\N	\N	\N	\N	\N	\N	santoshunique39@gmail.com	Office No. 909, 9th Floor, The Landmark, Sector 7, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
152	1769405698373egeiqkozu	Ishaque	GLOBAL INFRATECH	27AAUFG1680L1ZR	\N	\N	\N	+918779592726	\N	\N	\N	\N	\N	\N	global1319@gmail.com	Piyush Majestic, A-Wing, Shop No. 14, Diva-Shil Road, Old Dawale Gaon, Thane	f	2026-04-04 21:22:26.316713	f
153	1769405699825nf3f68g44	Kunal Gupta	SUCHITA ORANGE HDM PROJECT	27AAQAS6302Q1ZQ	\N	'+91 7977198122	\N	+919664877660	\N	\N	\N	\N	\N	\N	info@orangebuilders.in	Office No. 003, V.I.P. Plaza, Plot No. B-7, Andheri Link Road, Veera Industrial Estate, Mumbai, 400053	f	2026-04-04 21:22:26.316713	f
154	1769405701259vv760qclm	RAUTHER RIYASUDDIN	MAHIRAH TRAVELS - CORPORATE & LEISURE	27AFBPR4958N1ZP	\N	\N	\N	+919320588336	\N	\N	\N	\N	\N	\N	riyaz@mtcl.online	Haware Infotech Park, Office No. 2007, 20th Floor, Sector 30A, Vashi,, Navi Mumbai, 400703	f	2026-04-04 21:22:26.316713	f
155	176940570269120ekoavvw	Azhar Mohammad	Perusal Gulf Contracting Company	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	info@perusalgroup.com	Alluqman Building ‚Äì 6932, King Abdul Aziz Road, P.O. Box: 34442 ‚Äì 4660, Al Khobar	f	2026-04-04 21:22:26.316713	f
156	1769405704125mokhht1of	Amir Hamdule	RED BRICKS DEVELOPERS	27ABGFR7244G1ZZ	\N	9870282029	\N	\N	\N	\N	\N	\N	\N	\N	aamirhamdule1606@gmail.com	6th, Flat No 601, Hill View Apartment Plot no 57 & Plot No\r\n58, Sector 30, Kharghar,, Navi Mumbai, Maharashtra, 410 210	f	2026-04-04 21:22:26.316713	f
157	1769405705559nltvyfr47	Amir Hamdule	ANANDA BUILDSTONES LLP	27ABQFA6568G2ZW	\N	\N	\N	'+919870282029	\N	\N	\N	\N	\N	\N	hamdulemddevelopers@gmail.com	Shop No. 02, 1st Floor, Wajidali Compound, Sakinaka, 90 Feet Road,, Mumbai, Maharashtra, 400072	f	2026-04-04 21:22:26.316713	f
158	1769405706992p009uw4p4	Mohit Wakle	Space Designerss	27ADVPW9080A1ZW	\N	\N	\N	'+919819423250	\N	\N	\N	\N	\N	\N	space4482@gmail.com	A-002, RM-89, Shiv Sudama Nandan CHS, Milap Nagar, MIDC Resi. Zone, Near AIMS Hospital,, Dombivali East, Maharashtra, 421203	f	2026-04-04 21:22:26.316713	f
159	1769405708427639c9wmao	Prashant Thakur	KRISHNAKANT PROPERTIES	27ABWPT2172P1ZK	\N	\N	\N	+919819109000	\N	\N	\N	\N	\N	\N	kvksaless@gmail.com	S-2, KVK, Durvankur, Plot No.17, Rd.No.17, Sector 19, New Panvel (E),, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
160	1769405709860olymskzye	Sant Ram	AVRORA INDIA MARINE SYSTEMS PVT LTD	27AADCA1502D1ZG	\N	'+912227566671	\N	\N	\N	\N	\N	\N	\N	\N	mail@avroraindia.in	407, Raheja Arcade, Plot No. 61, Sector-11, CBD Belapur,, Navi Mumbai, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
161	1769405711396v3tvo0x4c	OUTING VILLA	OUTING VILLA	\N	\N	\N	\N	+918591868609	\N	\N	\N	\N	\N	\N	nishu.pandey5831@gmail.com	Panchvati River Side Society, B Wing, Building No. 2 Room No 402, Usarli Khurd, Near ONGC Colony,, Panvel, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
162	176940571278837jzogod5	HARLEQUIN INFRASTRUCTURES DEVELOPERS	HARLEQUIN INFRASTRUCTURES DEVELOPERS	27AAOFH8422P1ZM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	info@harlequindevelopers.com	Shelton Cubix, Plot No. 87, Near K Star Hotel, Sector 15, CBD Belapur,, Navi Mumbai, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
163	1769405714258w2p5zfcqk	Sanjeet Banthia	ANTAL BUILDERS AND DEVELOPERS LLP	27ACBFA1291J1ZH	\N	\N	\N	'+91 70399 39393	\N	\N	\N	\N	\N	\N	antalbuilder@gmail.com	Hyplap IT Solutions Pvt. Ltd., H. No. 776, Keshar Anand Niwas, Mahatma Gandhi Road, Old Panvel, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
164	17694057156119cw2cn2gr	Niraj Gala	Shree Dham Developers	27AETFS0834F1ZR	\N	\N	\N	'+919820515655	\N	\N	\N	\N	\N	\N	nirajgala@hotmail.com	\N	f	2026-04-04 21:22:26.316713	f
165	1769405717027d8y563e1p	Amir Hmdule	UNIQUE DEVELOPERS	27AAIFU1013B1ZR	\N	+919870282029	\N	+919892299312	\N	\N	\N	\N	\N	\N	hamdulemddevelopers@gmail.com	HD Pride, Plot No. 16, Sec-24, Taloja Phase-II, Taloja, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
166	1769405718564zdiiemz4n	Babulal Patel	SHIVANSH INFRA	27AEWFS7878E1Z0	\N	\N	\N	'+919730225400	\N	\N	\N	\N	\N	\N	shivanshinfra88@gmail.com	1707, Kamdhenu Commerz, Plot No. 2, Sec. 14, Kharghar,, Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
167	1769405719997c7l3d4vmj	Farooque Qazi	FAROOQUE MAHMOOD MIYA QAZI	27AACPQ7903L2ZB	\N	\N	\N	'+919870824698	\N	\N	\N	\N	\N	\N	farooque@kohinoorbuilders.com	Ground Floor, Tarique Heritage, Plot No. 39, Sector - 10, Taloja, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
168	1769405721430ymo7o8a2l	Nizam Momin	Ertekaaz Store	\N	\N	\N	\N	'+919819033728	\N	\N	\N	\N	\N	\N	ertekaaz.tech@gmail.com	\N	f	2026-04-04 21:22:26.316713	f
169	1769405722833veyutgm2a	Piyush Patel	TODAY REALTY	27AATFT0636Q1ZB	\N	\N	\N	'+918879349060	\N	\N	\N	\N	\N	\N	todayrealty183@gmail.com	Swarndeep Polyclinic, 1201, Siddhi Grandeur, KPC High School Road, Plot No. 84, Sector-19, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
170	1769405724256d7kfeqdxx	Kalpesh Chaudhari	DEVANSH ENTERPRISES	27AAWPC2464Q1ZY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PLOT NO 6, SECTOR NO 1, ROAD NO 2, PLOT NO 6, RAIGAD,, NAVI MUMBAI, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
171	17694057256912yysu2rya	Nagesh D. Dalvi	GREAT VISTA PROPERTIES LLP	27AAZFG6275C1ZW	\N	\N	\N	'+917045301580	\N	\N	\N	\N	\N	\N	greatvista07@gmail.com	Flat No.103 Plot No.51, Shiv Ganesh, Nawada, Opp Ravi Medical, Taloja,, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
172	1769405727166kp0d82web	Abhimanyu Bhagyawant	VISION GROUP	27AAXFV2389Q1ZR	\N	\N	\N	'+919323208734	\N	\N	\N	\N	\N	\N	visiongrp2016@gmail.com	Shop No. 06, Plot No. B8 & B9, Shree Sai Sagar CHS, Near Garam Masala Hotel, Sector 9, Airoli,, Navi Mumbai, 400708	f	2026-04-04 21:22:26.316713	f
173	1769405728565gkp1ums7m	S. F. ENTERPRISES	S. F. ENTERPRISES	27ABEPL0548F1ZV	\N	'+912223400007	\N	\N	\N	\N	\N	\N	\N	\N	s.f.enterprises47@gmail.com	Shop No. 2, 144/146, Bapu Khote Street, Jail Mohallah, Behind Gulal Wadi,, Mumbai, 400003	f	2026-04-04 21:22:26.316713	f
174	1769405730033nd6x5g0oe	Karan Bhatt	VILLA REALCON LLP	27AAOFV0834H1ZX	\N	\N	\N	'+919821297921	\N	\N	\N	\N	\N	\N	villainfra@gmail.com	Plot No. 21, Shop No. 18, Shiv Chambers, Sector-11, CBD Belapur,, Navi Mumbai, Maharashtra, 400708	f	2026-04-04 21:22:26.316713	f
175	1769405731460i2o5fviju	Ateeque Ahmad Shaikh	ANZ REALTY	\N	\N	9320442828	\N	\N	\N	\N	\N	\N	\N	\N	\N	Nexus Enclave, Plot No. 7, Sector-18, Taloja Phase-2,, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
176	176940573287412c2eeooq	KIND HEALTH AND HYGIENE PRIVATE LIMITED	KIND HEALTH AND HYGIENE PRIVATE LIMITED	27AAFCK3675F1ZE	\N	\N	\N	'+919004167827	\N	\N	\N	\N	\N	\N	scm-purchase@socomedpharma.com	B1-35,39, Junnar Taluka, Industrial Estate, Kandali, Tal. Junnar,, Pune, Maharashtra, 412412	f	2026-04-04 21:22:26.316713	f
177	17694057342994dgt1j63m	Arif Patel	GOLDEN REALITY	27ABGFM7768N1ZC	\N	\N	\N	'+919821636789	\N	\N	\N	\N	\N	\N	goldenrealityill@gmail.com	Plot No. 5, Sector-12, Taloja Phase 1,\r\nTaloja,, Navi Mumbai, maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
178	1769405735793b68xj7n9c	Faizal Shivkar	DASHANZI DEVELOPERS	27AAUFD7219G1Z2	\N	\N	\N	'+919892522466	\N	\N	\N	\N	\N	\N	dashanzidevelopers@gmail.com	806, 8th Floor, Satra Plaza, Sector-19D, Plot No. 20, Vashi,, Navi Mumbai, Maharashtra, 400 703	f	2026-04-04 21:22:26.316713	f
179	17694057371890neczj7kk	Nikhil	Sai Krupa Developers - Building 3	27ABSFS4091C3ZT	\N	\N	\N	'+919820256770	\N	\N	\N	\N	\N	\N	\N	Plot No. 1 to 29, New Survey No. 489, Chinchali, Karjat, Neral Raigad, Neral, Maharashtra, 410201	f	2026-04-04 21:22:26.316713	f
180	1769405738607ftmb9xiz7	Reena Anusaya	VISION DEVELOPERS AND BUILDERS	27AATFV5761G1ZI	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	visiondb20sk@gmail.com	Office:202, 2nd Floor, Neelkanth Landmark, Plot No.1/365/2A, Behind Orion Mall, Panvel,, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
181	1769405740004r81gvvxie	SAMRUDHI SHAILENDRA BHOSTEKAR	SAIDEEP FINANCIAL SOLUTIONS/SAIRAJ FASHON WORLD/GARGI FOOD PRODUCTS	27AHTPB8972C1Z0	\N	\N	\N	'+919145767555	\N	\N	\N	\N	\N	\N	sairajfashionworld@gmail.com	Shop No. 04, New Bhagyashree\r\nCHS. Ltd, Opp. Meenatai Thackray\r\nGarden, Karjat Road,, Badlapur (E), Maharashtra, 421503	f	2026-04-04 21:22:26.316713	f
182	1769405741593xz647s2qd	RAUTHER RIYASUDDIN	MARVEL TRAVELS - CORPORATE & LEISURE	27AFBPR4958N1ZP	\N	\N	\N	'+919320588336	\N	\N	\N	\N	\N	\N	riyaz@mtcl.online	Office No. 2007, 20th Floor, Haware Infotech Park, Sector 30A, Vashi,, Navi Mumbai, Maharashtra, 400703	f	2026-04-04 21:22:26.316713	f
183	1769405742959lfkypmc0m	Gautam	RIDDHI SIDDHI INFRASTUCTURE	27AAVFR3457R1Z0	\N	\N	\N	'+917666692792	\N	\N	\N	\N	\N	\N	\N	Ground Floor, Shop A-80, Janta Market, Sector-23, Turbhe,, Navi Mumbai, Maharashtra, 400705	f	2026-04-04 21:22:26.316713	f
184	1769405744368lt3tg2jr7	Arsalan Khan	HERITAGE CONSTECH LLP	27AAIFH4563R1ZM	\N	\N	\N	'+919819515281	\N	\N	\N	\N	\N	\N	\N	Hilton Centre, Office No. 110, Plot No. 66, Sector-11, CBD-Belapur,, Navi Mumbai, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
185	1769405745801h8hvcaahs	Sarfraz Shaikh	DREAMZ REALTY	27AALFD7744B1ZF	\N	\N	\N	'+919223258026	\N	\N	\N	\N	\N	\N	sarfarazmaqbool@yahoo.com	GRD FLOOR, SHOP NO.01, BLOSSOM BLDG, DREAMS PARK,\r\nNEAR DILKAP COLLEGE ROAD, MAMDAPUR,, KARJAT, Maharashtra, 410101	f	2026-04-04 21:22:26.316713	f
186	1769405747234zozxjozr5	Nisar Ahmed	Nisar Ahmed Sai Mohammed Khan	\N	\N	\N	\N	'+919820386123	\N	\N	\N	\N	\N	\N	\N	Bat-Ha Residency, Plot 12C, Sec-24, Taloja Phase-I,, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
187	17694057486506xzooxyxr	Piyush Patel	SHREEJI HOMES	27AEZFS9169P1ZE	\N	\N	\N	'+919324181110	\N	\N	\N	\N	\N	\N	shreejihomes555@gmail.com	Estrella, Plot No. 109, Sector 11, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
188	1769405750179y9w0ym76f	Govind Patel	SRK Build Space Pvt. Ltd.	\N	\N	\N	\N	'+919956100561	\N	\N	\N	\N	\N	\N	\N	B-12, Silver Stripas, Vakola Pipeline, Santacruz East,, Mumbai, Maharashtra, 400055	f	2026-04-04 21:22:26.316713	f
189	1769405751550jeo532tlj	CECS ENGINEERS PRIVATE LIMITED	CECS ENGINEERS PRIVATE LIMITED	27AAKCC6904A1ZX	\N	\N	\N	'+919867189909	\N	\N	\N	\N	\N	\N	\N	The Landmark, Office No. 806, \r\nPlot No. 26/A, Sector -7, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
190	17694057529713b5poh1di	Vikas Benke	Dreams Property	\N	\N	\N	\N	'+919022777040	\N	\N	\N	\N	\N	\N	\N	Shop No. 17, Shelter Empire, Plot No. 205,206, Sector -10, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
191	17694057543745vrv2l6bh	Jitesh Agarwal	SAFFRON DEVELOPERS	27AFBFS0538R1ZH	\N	\N	\N	'+919820229097	\N	\N	\N	\N	\N	\N	\N	Plot No. 46/1, Sector-18, Ulwe,, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
192	1769405755739ckm8gl50n	Aijaz Khan	PINNACLE CONSTRUCTION	27AAQFP7833C1ZY	\N	\N	\N	'+919819354988	\N	\N	\N	\N	\N	\N	sales@innovativeconstruction.co.in	Innovative Palace, Plot No. 157, Sec 44, Seawoods, Nerul,, Navi Mumbai, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
193	1769405757170bwhxnpi4j	Swapnil Sawant	Thomas Cook (India) Limited	\N	\N	\N	\N	'+919769830466	\N	\N	\N	\N	\N	\N	swapnil.sawant@thomascook.in	324, Doctor Dadabhai Naoroji Road Fort,, Mumbai, Maharashtra, 400001	f	2026-04-04 21:22:26.316713	f
194	1769405758605gpzc11v6s	Saqib Khan	Sukha Shanti Builders & Developers	\N	\N	\N	\N	'+919819783441	\N	\N	\N	\N	\N	\N	\N	Shop No. 3, Citizen Building, 3rd Cross Lane, Lokhandwala Complex, Andheri (W),, Mumbai, Maharashtra, 400053	f	2026-04-04 21:22:26.316713	f
195	1769405759973m4lepgr8x	Nisar Shaikh	Ayesha Enterprises	\N	\N	\N	\N	'+919324431117	\N	\N	\N	\N	\N	\N	ayeshaenterprises1117@gmail.com	Shop No. 4, Shree Govardhan\r\nArcade, Plot No. 23, Sector-11,\r\nTaloja Phase I, Taloja,, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
196	176940576137029s7wz0uu	Salman Patel	Vaishnavi Builders and Developers	\N	\N	\N	\N	'+919769506062	\N	\N	\N	\N	\N	\N	vaishnavivbd62@gmail.com	House No. 16, Podi No. 1,\r\nSector-15,, New Panvel, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
197	1769405762801ycutuhk3r	Chowdhary Infra Projects	Chowdhary Infra Projects	27AATFC5611Q1ZR	\N	'+917021613756	\N	'+919833737834	\N	\N	\N	\N	\N	\N	chowdharyinfraprojects23@gmail.com	9th Floor, Flat No. 902, Classic Tower, Plot No. 11, Sect-18, Phase-Il, Panchnand,, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
198	1769405764338hefrzl32x	WHITESHED SOLUTIONS LLP	WHITESHED SOLUTIONS LLP	27AAEFW5968P1Z4	\N	\N	\N	'+919145320002	\N	\N	\N	\N	\N	\N	contact@whiteshedsolutions.com	Plot No. 120/121, Sagar Market, Mumbai Pune Road, Shilphata Junction, Koparkar Shil Rd,, Thane, Maharashtra, 421204	f	2026-04-04 21:22:26.316713	f
199	1769405765754gg8qvqfs3	Hiren Thesia	DEVBHUMI CONSTRUCTION	27AATFD8699K1Z8	\N	\N	\N	'+919022750003	\N	\N	\N	\N	\N	\N	devbhumiconstruction@yahoo.com	Murlidhar Homes, CTS No. 4302, Next to Gagangiri Ashram, Khopoli, Raigad, 410204	f	2026-04-04 21:22:26.316713	f
274	1774940888312	Deepika Madam	Sunrise Global School & JR College	\N	\N	+91 98993 24351	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
200	1769405767200yeas8o8py	Naitik Gupta	SHIV BUILDERS AND DEVELOPERS	27AECFS3743N1ZL	\N	\N	\N	'+919820085510	\N	\N	\N	\N	\N	\N	shivbuilders011@gmail.com	Shop No. 08, Plot No. 8 & 8A, Sai Darshan Apartment, Sector 19, Near Vista Corner, Kamothe,, Navi Mumbai, Maharashtra, 410209	f	2026-04-04 21:22:26.316713	f
201	1769405768585zon3h8jmj	Kaif Solkar	MISBA HOLIDAYS PRIVATE LIMITED	27AAHCM0059P1Z1	\N	\N	\N	'+919820467567	\N	\N	\N	\N	\N	\N	\N	Unit No. 3074A, 3rd Floor, Wing- V, Block C, Akshar Business Park, Plot No. 3, Sector 25, Vashi,, Navi Mumbai, Maharashtra, 400703	f	2026-04-04 21:22:26.316713	f
202	1769405769960w9b235r93	BAJAJ INTERNATIONAL SCHOOL	BAJAJ INTERNATIONAL SCHOOL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Mangala Residency plot no 3 sec 24 Taloja phase 2,Pincode ,Pincode -410208Address - Survey No. 110/3 A, next to Taloja phase 2 RTO, Ghot camp Koyana Vele,, Panvel, 410208	f	2026-04-04 21:22:26.316713	f
203	1769405771403wrgunxxnd	Priyank Patel	Satpanth Creation	\N	\N	\N	\N	'+918169744396	\N	\N	\N	\N	\N	\N	\N	Kalash Serenity, Plot No. 26, Sector-7, Pushpak Nagar, Dapoli,, Navi Mumbai, Maharashtra, 410221	f	2026-04-04 21:22:26.316713	f
204	17694057728376v098jzen	Abdul Mabood	J. K. BOOK DEPOT	\N	\N	\N	\N	'+919838230091	\N	\N	\N	\N	\N	\N	jkbookdepot9@gmail.com	Khairul-Uloom Building, Opp. Bharat Nagar Petroleum, Dumariya Ganj, Distt. Siddharth Nagar,, Siddharth Nagar, Uttar Pradesh, 272189	f	2026-04-04 21:22:26.316713	f
205	1769405774281bdbz7atue	IQRA PUBLIC SCHOOL	IQRA PUBLIC SCHOOL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	SEKHUIYA QASBA \r\nUTRAULA, BALRAMPUR,, BALRAMPUR, Uttar Pradesh, 271604	f	2026-04-04 21:22:26.316713	f
206	1769405775686v1c4wanbx	Mitesh Bhupendra Thakkar	NEEL RIDDHI ASSOCIATES	27AAJFN8059K1ZM	\N	\N	\N	'+919819335359	\N	\N	\N	\N	\N	\N	neelriddhiassociates@gmail.com	Plot No. 29/7, GR. Floor, Riddhi Rose, OPP. SAI NAGAR ROAD, OPP. SUSHEEL GARDEN, PANVEL, Raigad, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
207	1769405777097josu9xdeo	Parag Chatwani	WHIZZO RATHAHUB INDIA PRIVATE LIMITED	27AADCW7677B1Z2	\N	'+919082160671	\N	'+919867632366	\N	\N	\N	\N	\N	\N	\N	Office No. 422, 4th Floor, Avior Corporate Society, L.B.S. Marg, Mulund (W), Mumbai, Maharashtra, 400080	f	2026-04-04 21:22:26.316713	f
208	1769405779085w0c4r9724	SAIRAJ ENTERPRISES	SAIRAJ ENTERPRISES	27ABXFS0930M1ZH	\N	\N	\N	'+918898473333	\N	\N	\N	\N	\N	\N	sairaj9333@yahoo.com	Plot No. 33, Shop No. 6, Sector-19, Opp. Bhoomi Raj Meadows, Airoli,, Navi Mumbai, 400708	f	2026-04-04 21:22:26.316713	f
209	1769405780959hptfy5nds	NAOMAN BASHEER	NAOMAN BASHEER	\N	\N	\N	\N	'+919579467085	\N	\N	\N	\N	\N	\N	\N	H No. 9-8-110/C/48/1 SALEH NAGAR, DHAN KOTA, Madrasa Ibadur Rahman (Hifz-e-Quran) GOLCONDA FORT,, HYDERABAD, Telangana, 500008	f	2026-04-04 21:22:26.316713	f
210	1769405782445x32152goh	Hitesh Khubchandani	RAVI KIRAN ENTERPRISES	27AAXFR9268A1ZK	\N	\N	\N	'+919930777082	\N	\N	\N	\N	\N	\N	\N	SHOP NO 1, SAI DARSHAN, PLOT NO 8/8A,SECTOR-19, KAMOTHE, Raigad, Navi Mumbai, Maharashtra, 410209	f	2026-04-04 21:22:26.316713	f
211	1769405783897sog0j4ep4	OSPREY NEST LLP	OSPREY NEST LLP	27AAJFO2159B1ZF	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	A 412, BOOMRANG EQUITY BUSINESS PARK, CHANDIVALI FARM HOUSE, MUMBAI, Mumbai Suburban, Maharashtra, 400072	f	2026-04-04 21:22:26.316713	f
212	1769405785255mpcj3h369	PRINT MUMBAI	PRINT MUMBAI	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	NAVI MUMBAI, 410210	f	2026-04-04 21:22:26.316713	f
213	17694057867648jft9fjq7	Ramchandra Morajkar	A R CONSTRUCTIONS	27AAJFA2917P1Z2	\N	\N	\N	'+919869797029	\N	\N	\N	\N	\N	\N	arcrre1234@yahoo.co.in	1,2,3, Swami Samarth, Plot No. E/1-C, Sector 12, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
214	1769405788197pu45jysa1	AGNIVESH TIKOO	AGNIVESH TIKOO	27AFSPT8338P1Z4	\N	'+919082175904	\N	'+918879005175	\N	\N	\N	\N	\N	\N	agniveshtikoo@gmail.com	VITASTA SPINE CLINIC\r\nC/o DER-MED, Shop No 5, 6, 7; Chamunda Serene, Sector 38,\r\nSeawoods (W),, Navi Mumbai, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
215	1769405789659lx87lzvcp	Inzamam Velaskar	SM GROUP	27AEQFS2285F1ZL	\N	'+919689119196	\N	'+918554852595	\N	\N	\N	\N	\N	\N	\N	1306, MUKHTAR IBRAHIM VELASKAR, Goregaon Main Road, Goregaon, Raigad, Maharashtra, 402103	f	2026-04-04 21:22:26.316713	f
216	1769405791039xqzdomks0	FRANKLINE TECHNOLOGY PRIVATE LIMITED	FRANKLINE TECHNOLOGY PRIVATE LIMITED	27AAFCF2688H1ZC	\N	\N	\N	'+917823882160	\N	\N	\N	\N	\N	\N	info@franklinzo.com	OFFICE NOS-711 & 712, The Landmark, SECTOR- 7 PLOT NO- 26 A, Navi Mumbai, Thane, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
217	1769405792419ixyzlcpq8	KRYSTAL INFRA	KRYSTAL INFRA	27ABBFK5006G1ZN	\N	\N	\N	'+919819354988	\N	\N	\N	\N	\N	\N	krystalinfraseawoods@gmail.com	Shop No. 1, Innovative Palace CHS, Plot No. 157, Sector-44, Nerul, Navi Mumbai, Thane, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
218	176940579382936b7sjnto	GAURAV KANDPILE	KANDPILE BUILDERS & DEVELOPERS	27ABDFK9223F1ZC	\N	\N	\N	'+919920868008	\N	\N	\N	\N	\N	\N	kandpilebuildersanddevelopers@gmail.com	PL-413 SHOP NO.-6, Channel Elegance Apartment, Takka Road, Navi Mumbai, Raigad, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
219	17694057952639eouu745k	RAMNARAYAN PHOOLCHANDRA	GANESHA DEVELOPER	27ABCFG2811J1ZK	\N	\N	\N	'+918080035533	\N	\N	\N	\N	\N	\N	\N	Plot no 463, Pramila Niwas, 24th Road, sector 24, Navi Mumbai, Raigad, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
220	1769405796799al89c19iy	SPACE PLANNER	SPACE PLANNER	27CJFPP2745H1Z0	\N	\N	\N	'+919960482404	\N	\N	\N	\N	\N	\N	nirmaanaishwaryam@gmail.com	SERVEY NO 67/2/9, SWAMI VIVEKANAND NAGAR, NEW SANGVI, Pune, Maharashtra, 411061	f	2026-04-04 21:22:26.316713	f
221	1769405798185qs00nld2j	Aniket Patel	KALINDEE ENGINEERING	27AAYFK8290J1ZB	\N	\N	\N	'+919987887153	\N	\N	\N	\N	\N	\N	eng@kalindee.co.in	Gala No. D/2, Elite Industrial Estate No.1, Near Vasai Express Highway, Vasai Virar, Palghar, Maharashtra, 401208	f	2026-04-04 21:22:26.316713	f
222	1769405799561716emyfkz	Manish Jawaharlal Gilda	KAMAL PROPERTIES	27ABAFK7359R1ZH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shop No. 1 and 2, Plot No. 64, Shree Saikrupa CHS,\r\nM.C.C.H Society, Navi Mumbai, Raigad, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
223	1769405800997i8bqzkjp1	Bait Zayan	Bait Builders & Developers	\N	\N	'+919870282029	\N	\N	\N	\N	\N	\N	\N	\N	hdbuildersanddevelopers@gmail.com	A K Orion, Shop No. 10/11/12/13, Plot No. 4, Sector-16, Taloja Phase-2, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
224	1769405802360w8by6dw95	Ketan Tanna	OMKAR INFRA	27AAHFO9546N1ZF	\N	\N	\N	'+919987304577	\N	\N	\N	\N	\N	\N	\N	Office No 401-B, Mayuresh Chamber Premises, Sector No-11, Plot No-60, Navi Mumbai, Thane, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
225	176940580396892xpnxtio	Tarique Qazi	TARIQUE FAROOQUE QAZI	27AAWPQ7963J1ZK	\N	\N	\N	'+919082837917	\N	\N	\N	\N	\N	\N	tarique@kohinoorbuilders.com	PLOT NO-39, TARIQUE HERITAGE, SECTOR-10,PHASE-1, Taloja, Panvel, Raigad, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
226	17694058053718fvqps1qb	Farooque Qazi	KOHINOOR DEVELOPERS	27AAVFK7779F1ZF	\N	\N	\N	'+919870824698	\N	\N	\N	\N	\N	\N	farooque@kohinoorbuilders.com	Plot No. 39, Tarique Heritage, Gami Road, Taloja, Panvel, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
227	1769405806852kkurzpoh8	Sayed Abdullah Hashmi	ROYAL ENTERPRISE	27AAPFR2974M1ZC	\N	\N	\N	'+919892781678	\N	\N	\N	\N	\N	\N	royalslandmark@gmail.com	Opp. Anjana Building, Old Reti Bunder, Pestom Sagar Road NO 6, Chembur, Mumbai, Mumbai, Maharashtra, 400089	f	2026-04-04 21:22:26.316713	f
228	1769405808355hiztuyql0	Manjeet Tushir	TUSHIR DEVELOPERS	27AATFT8113G1ZS	\N	\N	\N	'+919920194950	\N	\N	\N	\N	\N	\N	info@tushirdevelopers.com	OFFICE NO 412, Niharika Mirage, Kopra Road, Navi Mumbai, Raigad, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
229	1769405809737iqm4se2lg	Karan Patel	HITECH STRUCT CON	27AAQFH0464B1ZJ	\N	\N	\N	'+918369696001	\N	\N	\N	\N	\N	\N	\N	OFFICE NO-905, Mayuresh Chamber, PLOT NO-60, SECTOR-11, Navi Mumbai, Thane, Maharashtra, 400614	f	2026-04-04 21:22:26.316713	f
230	17694058111979kam0f14z	Sandeep Sawant	SANDEEP GUNDAJI SAWANT	27BBXPS3263A1ZC	\N	\N	\N	'+91-9322765110	\N	\N	\N	\N	\N	\N	\N	34A, Bhoomi Landmark, Khandeshwar Station Road, Navi Mumbai, Raigad, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
272	1774866249817	Harpreet Takkar	Prop Kingdom	\N	\N	+918850636414	\N	\N	\N	\N	\N	\N	\N	\N	propkingdom13@gmail.com	No. 69, Sector 21, Kharghar, , Navi Mumbai, 410210	f	2026-04-04 21:22:26.316713	f
231	1769405812691a5mpnn4vl	Sanjay Mehta	SHREEJI HOMELAND PRIVATE LIMITED	27AALCS3556M1ZP	\N	\N	\N	'+91-9821312345	\N	\N	\N	\N	\N	\N	sanjay@shreejigroup.biz	GARAGE 1/67, VIVEK BUILDING, NEW ASHOKA SOCIETY, TILAK ROAD, GHATKOPAR EAST, Mumbai, Maharashtra, 400077	f	2026-04-04 21:22:26.316713	f
232	1769408758497	Yash Morajkar	Morajkar Estates LLP	\N	\N	9869797029	\N	9967833332	\N	\N	\N	\N	\N	\N	morajkarestate@yahoo.com	Shop No. 1, Swami Samarth, Plot No. E/1-C., Sector 12,, Kharghar, Navi Mumbai., Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
233	1769416207478	Yasin Dalvi	Dashanzi Developers	\N	\N	9822488417	\N	9892522466	\N	\N	\N	\N	\N	\N	\N	At - Uktad , Chiplun, Ratnagiri, Maharashtra	f	2026-04-04 21:22:26.316713	f
234	1769417820846	Mubin Bhai	Ayesha Builders And Developers	\N	\N	9769151003	\N	\N	\N	\N	\N	\N	\N	\N	Ayeshaenterprises03@gmail.com	Ayesha, Plot No. 1A, Sector -15, Taloja Phase -1, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
235	1769420500453	Habib Khan	Planet Builders & Developers	\N	\N	9769775100	\N	9821840315	\N	\N	\N	\N	\N	\N	habibk284@gmail.com	Office No. 1, 1st Floor, Dr Babasaheb Ambedkar Samta Bhavan,Planet House, Plot No. 42,Sector 10, Sanpada, Navi Mumbai, Maharashtra, 400705	f	2026-04-04 21:22:26.316713	f
236	1769421781360	Yasin Dalvi	Yasin Dalvi	\N	\N	+919822488417	\N	+919822112575	\N	\N	\N	\N	\N	\N	\N	Chiplun, Ratnagiri, Maharashtra	f	2026-04-04 21:22:26.316713	f
237	1769422582752	Shakeel Khan	Ghazi Darbar Caterers	\N	\N	7987713221	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shelter Complex, Shop No.17, Plot No.12B Sector 8, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
238	1769427024492	Naeem	A N Group	\N	\N	+91 98208 02069	\N	\N	\N	\N	\N	\N	\N	\N	andevelopers42@gmail.com	AN Arcade, (Bhimai Gopal Apartment), Shop No. 2 & 3, Plot-01, Behind HP Petrol Pump, Near Dominos Pizza, Sector - 44,, Seawoods (W), Nerul,, Navi Mumbai, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
239	1769428132300	Malti Shejwal	TRUE BLUE	\N	\N	+919167252497	\N	\N	\N	\N	\N	\N	\N	\N	\N	Panvel, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
240	1769429026537	Girish  Rudani	Girish Rudani	\N	\N	+919320819178	\N	\N	\N	\N	\N	\N	\N	\N	swastikgirishpatel@gmail.com	Badlapur	f	2026-04-04 21:22:26.316713	f
241	1769429313215	Sandeep Sawant	PURVA PROPERTIES	27BBXPS3263A1ZC	\N	+919322765110	\N	\N	\N	\N	\N	\N	\N	\N	sandeepsawantgroup@gmail.com	34A, Bhoomi Landmark, Khandeshwar Station Road , Navi Mumbai, Maharashtra , 410206	f	2026-04-04 21:22:26.316713	f
242	1769432885480	Arsalan  Khan	Manzil Group	\N	\N	+919819515281	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
243	1769435669974	Khurshid Ansari	Z. P. CONSTRUCTION	\N	\N	+919158337908	\N	+919320951686	\N	\N	\N	\N	\N	\N	\N	Beside Safiya School, Salamatpura, Naigaon,, Bhiwandi, Maharashtra	f	2026-04-04 21:22:26.316713	f
244	1769438610248	Dr. VISHAL CHAFALE	Neuron Super Speciality Clinic	\N	\N	+919326645003	\N	+918697092278	\N	\N	\N	\N	\N	\N	vishalchafale@gmail.com	Shop No. 1 & 2, The Signature Seawoods, Sector 44-A, Nerul,, Navi Mumbai, Maharashtra, 400706	f	2026-04-04 21:22:26.316713	f
245	1769443578855	Sanjay Yadav	Varsha Civil Services	\N	\N	+919320872072	\N	+919594770747	\N	\N	\N	\N	\N	\N	\N	No. 05, Sector - 2, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
246	1769506952695	Vinayak Shukla	Aradhna Dental Clinic	\N	\N	7738867890	\N	\N	\N	\N	\N	\N	\N	\N	drvinayakshukla@gmail.com	LIG, 1st M-40/41, Sec-3, Kalamboli, Navi Mumbai, Maharashtra, 410218	f	2026-04-04 21:22:26.316713	f
247	1769574462748	Dr. Sayed Faraz Hussain	FAZAL EYE CLINIC	\N	\N	+919167438943	\N	\N	\N	\N	\N	\N	\N	\N	fazaleyeclinic@gmail.com	GN 2-3, Patel Apartment, Plot No -56, 57, 58; Next to CIDCO Garden, Sector-10, Taloja Phase-1,, Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
248	1769841835766	Ashraf Chowdhary	Drillboss Infra Project	\N	\N	9919006930	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
249	1770017042592	Shaykh Mohammad Ismail Jamai	MADARSA AISHA SIDDIQUA (RZ)	\N	\N	+91 99869 78536	\N	+91-8904386039	\N	\N	\N	\N	\N	\N	madarsaaishasiddiqua.official@gmail.com	Anwar Mansion, Near The City Academy, Zam Zam Colony,, Kalaburagi, Gulbarga, Karnataka, 585104	f	2026-04-04 21:22:26.316713	f
250	1770710035343	ADVIK RREALTY	ADVIK RREALTY	\N	\N	9117366566	\N	\N	\N	\N	\N	\N	\N	\N	info@advikrrealty.com	Office No . C- 102, 1st Floor, Yasho Narayan Building, Plot No. 403 A, Opp. Panvel Railway Station,  Old Panvel, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
251	1770794614922	Naeem Patel	Asil Infracon LLP	\N	\N	8655403001	\N	9821462245	\N	\N	\N	\N	\N	\N	\N	Off: Shop No. 7, Asil Paradise, Plot No. 17, Sector -19, Taloja Phase-||, , Navi Mumbai, Maharashtra, 410208	f	2026-04-04 21:22:26.316713	f
252	1770807038670	Balaji  Gaikwad	 Sai Enterprises Industrial Consultancy Services	\N	\N	8976448198	\N	\N	\N	\N	\N	\N	\N	\N	balajigaikwad1991@gmail.com	\N	f	2026-04-04 21:22:26.316713	f
253	1771308223990	Nilesh	GRK Infra Developments	\N	\N	9223368103	\N	\N	\N	\N	\N	\N	\N	\N	grkinfradevelopments@gmail.com	A-42/30, Shree Raj, Sector - 12, Near Indian Oil Petrol Pump, Kharghar, Navi Mumbai , MAHARASHTRA,  410210	f	2026-04-04 21:22:26.316713	f
254	1771481187109	Mukesh  Tajani Metal	Tajani Metal And Alloys	27BJUPJ8028B1Z0	\N	9167222886	\N	9860222886	\N	\N	\N	\N	\N	\N	tajanimetal@gmail.com	Shop No.3,Grow More CHS,, Plot No.5, Sector-2, Near Siemens Tower, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
255	1772265117179	Mr. Darshan Singh	ALTAMONTT REALTY LLP	\N	\N	+919930281381	\N	\N	\N	\N	\N	\N	\N	\N	\N	Office No. 811, Shelton Sapphire, Plot No. 18,19, Sector-15, CBD Belapur,, Navi Mumbai, 400614	f	2026-04-04 21:22:26.316713	f
256	1772449776786	Hannan  Kashmiri	SKYLINE BUILDERS AND DEVELOPERS	\N	\N	+918655108767	\N	\N	\N	\N	\N	\N	\N	\N	hannan778866@gmail.com	Skyline Prime, Plot No.365/366, Sector 19, Ulwe,, Navi Mumbai, Maharashtra, 410206	f	2026-04-04 21:22:26.316713	f
257	1772458526498	Naitik Gupta	Gaj Infra	\N	\N	+91 98200 85510	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
258	1773124011519	Manish  Hirani	Rituraj Developers	27AAXFR9624E1ZK	\N	91 98670 82257	\N	\N	\N	\N	\N	\N	\N	\N	riturajdevelopers@gmail.com	Flat- 1203, Mauli Darshan, Plot No. 9, Sector-15, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
259	1773197010889	Shelter	Shelter	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	2026-04-04 21:22:26.316713	f
260	1773197259826	Rabbani Khan	SHELTER BUILDERS	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
261	1773214936731	Kaustubh Patil	Skyline Contractor	27AKJPP0922B1ZH	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	skylincontractors.71@gmail.com	1601, Omkar Heights, Plot No. 30, Sector 35 E, Kharghar, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
262	1773293854072	Ashish Padwal	Nirmaan Group	\N	\N	9960482404	\N	\N	\N	\N	\N	\N	\N	\N	nirmaanaishwaryam@gmail.com	Flat No. 1B, Mhokar Raj Park,, Shitole Nagar, Old Sangvi., Pune, Maharashtra, 411027	f	2026-04-04 21:22:26.316713	f
263	1773654503938	Shemoil Momin	Shemoil Momin	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
264	1773654596680	SHEMOILA	SHEMOILA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
265	1773654663193	Majid Patel	Ideal Builders & Developers	\N	\N	+91 97737 21299	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
266	1773654792256	Dr. Faris Khan	Crescent Multi Speciality Clinic	\N	\N	+919898900886	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shop 12 /13, Shelter Riverside, Plot 114, Sector 14, Taloja Panchanand, Phase 1, Taloja,, Navi Mumbai, 410208	f	2026-04-04 21:22:26.316713	f
267	1773655647038	GURUNATH PANDHARINATH PHADKE	OM SAIRAM DEVELOPERS LLP	27AAJFO9996N1ZZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shop No. 115, Building 1/2, Nagarpalika Building, , Panvel, Matheran, 410206	f	2026-04-04 21:22:26.316713	f
268	1773732732098	Vicky Digital	Vicky Digital	\N	\N	+919773778876	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
269	1774252406947	Aqua Vista Buildcon LLP	Aqua Vista Buildcon LLP	\N	\N	9987596001	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
270	1774604313959	MR SATYAJEET CHAVAN	SHREE YASH HARDWARE	\N	\N	9405255940	\N	\N	\N	\N	\N	\N	\N	\N	\N	Shop No. 3, Ground Floor,Zion Mount4,, Plot No. 45, Sector-35,, Kamothe, Tal-Panvel, Dist-Raigad,, Maharashtra, 410209	f	2026-04-04 21:22:26.316713	f
271	1774698454366	Jayashree Groups & Company	Jayashree Groups & Company	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
275	1775015491119	Saud  Siddiqui	Mr. Saud Siddiqui	\N	\N	+91 98707 30960	\N	\N	\N	\N	\N	\N	\N	\N	\N	Taloja, Navi Mumbai	f	2026-04-04 21:22:26.316713	f
276	1775022360222	Shubham Waichale	STHAVIYAA INFRAWORKS	\N	\N	+91 91360 98777	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
277	1775022752899	Mr. Ram Bhagyavant	Mr. Ram Bhagyavant	\N	\N	+91 93212 48697	\N	\N	\N	\N	\N	\N	\N	\N	ramambhe@gmail.com	\N	f	2026-04-04 21:22:26.316713	f
278	1775107509358	MAHESH  VIRALE	MAHESH VIRALE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-04-04 21:22:26.316713	f
279	1775128610577	Vinod  Soman	Evershine Lifespace	27AAMFE3839P1ZO	\N	+91 9867189909	\N	\N	\N	\N	\N	\N	\N	\N	info@evershinelifespace.com	The Landmark, Office No. 806, , Plot No. 26/A, Sector-7, Kharghar,, Navi Mumbai, Maharashtra, 410210	f	2026-04-04 21:22:26.316713	f
280	1775133401017	Vinod Soman	Evershine Lifespace	\N	\N	+91 98671 89909	\N	\N	\N	\N	\N	\N	\N	\N	\N	Kharghar, Navi Mumbai	t	2026-04-04 21:22:26.316713	f
281	CLT-1775557240692	Deepak Karande	Destination Architects		Deepak Karan												f	2026-04-07 14:20:40.69275	f
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.comments (id, entity_type, entity_id, user_id, message, created_at, parent_id) FROM stdin;
1	order	2	5	sent for review	2026-02-12 06:15:42.302	\N
2	order	2	5	Balaji Heights  Brochure Re-size, Modifications & Printing (with Inserts and Pocket)  Quantity: 500 Copies Main Brochure: 20 Pages  Brochure Size: 9.5” x 13.5” Paper: 270 GSM Fine Paper  Inserts: 10 Pages Insert Size: 10.5” x 7.5” Paper: 170 GSM Indian Art Paper Printing: Single Side Printed  Special Feature: One Attached Paper Pocket on the 2nd Last Page (to hold the 10 inserts / additional documents)  Total Cost: ₹ 1,38,500/- GST Extra	2026-02-24 05:43:00.447	\N
3	order	2	5	followup email kiya hai aaj	2026-03-07 05:28:23.242	\N
4	order	2	5	Subhash Sir ko whatsapp par message bhi kiya.	2026-03-07 07:18:10.289	\N
5	order	2	1	@Nizam Kishor sir se baat huvi hai aaj, wo check karke batayenge.	2026-04-01 05:48:05.468	\N
6	order	3	3	Geetanjali madam call kiye the unko brochure ka dummy chahiye. final elevation madam share karne wale hain.	2026-01-28 06:03:25.157	\N
7	order	3	5	Dummy sent to print by Qamar	2026-01-30 05:43:32.366	\N
8	order	3	5	The dummy brochure will be ready by 31st Jan 26	2026-01-30 12:54:39.642	\N
9	order	3	4	Rajesh Printouch, Invoice No. 7271/2025-26	2026-02-24 03:33:46.519	\N
10	order	3	5	Cheque Rcvd. ₹ 788/- TDS cut kiya hai	2026-03-31 05:08:28.961	\N
11	order	6	5	Print Hub #19973	2026-01-26 11:56:47.739	\N
12	order	6	4	Printhub, Invoice No: OL-009581/25-26	2026-01-28 06:17:06.485	\N
13	order	7	5	@Qamar follow-up le lo	2026-02-24 05:28:35.43	\N
14	order	7	1	@Nizam Mubin bhai ko phone kiya poori bell huvi but phone receive nahi kiye, message karta hun unko.	2026-02-24 06:27:17.013	\N
15	order	7	5	ek week ke baad wapas followup lena hai. agar us wat bhi final nahi karte hain to designing ke payment ke liye bolna hai.	2026-03-07 08:08:26.273	\N
16	order	9	4	Paras Digital, Invoice No.: 00243/2025-26	2026-02-07 05:40:55.896	\N
17	order	9	5	12,350/- designing + 31750/- star flex	2026-02-09 04:48:23.3	\N
18	order	10	5	@Qamar apni side se baaqi hai ya client ki side se	2026-02-24 05:29:06.103	\N
19	order	10	1	@Nizam abhi Ajaz sir ko call kiya tha phone nahi lag raha hai, waise ek hafte pehle inse baat kiya tha, wo bole they ke discuss karke aapki office par aata hun.	2026-02-24 06:25:44.873	\N
20	order	11	1	Briefing from client about Brochure designing, Client ko Sai Mannat ka brochure bahut pasand aaya hai.. usi hisaab se design karne bola hai.. Brochure vertical rahega.. colour combination and flow and content sequence as per Sai Mannat brochure rahega.. main client ko ek hafte ka time diya hun Brochure designing keliye.	2026-02-05 14:29:30.033	\N
21	order	11	1	@Nizam Aaj Dhaval patel sir ko mockup share kiye hain Brochure design ka.	2026-02-18 10:02:30.313	\N
22	order	11	1	@Nizam Dhaval sir ko do alag alag qoutation dena hai, ek jo design bani hai 28 pages ko with pocket and floor plan insertion, and ek sirf 28 pages ka without pocket.\n	2026-02-19 10:59:33.565	\N
23	order	11	1	@Nizam Dhaval sir ko 28 pages me hi jana hai, qty abhi confirm nahi hai, Floor Plans bhi 28 pages me hi rahega, kuch pages re-design karna padega adjustment keliye.	2026-02-25 07:18:00.655	\N
24	order	11	1	@Nizam Sent for review	2026-02-27 09:48:38.626	\N
25	order	11	1	@Nizam Hari Shrushti ke partners aaye they Brochure me kuch correction karna hai, aur client ko ek Dummy print chahiye. Corrections : Projects features from old brochure, New Key Layout Plan, and some finishing work.	2026-02-28 06:46:40.195	\N
26	order	11	5	Dummy ready	2026-03-07 08:37:12.131	\N
27	order	12	3	Binding pad : 30 Pads ( in each pad 33 pages )     	2026-01-28 06:46:50.956	\N
28	order	13	5	نیا پلان چینج کرکے بھیجا ہوا ہے۔ کلائینٹ کی سائیڈ سے رکا ہوا ہے۔	2026-01-26 11:29:10.42	\N
29	order	14	5	Plates banne ke baad changes karwaye hain, phone numbers bhi change karwaye hain. is plate making charges lagana hai.	2026-01-26 11:38:03.459	\N
30	order	17	5	aaj followup message kiya hai	2026-03-07 05:18:30.359	\N
31	order	22	5	@Qamar is ka followup le lo	2026-02-24 05:24:49.924	\N
32	order	22	1	@Nizam Arsalan sir ko call kiya tha, wo kal batane wale hain aaj unki tabiyat theek nahi hai.	2026-02-24 06:22:54.769	\N
33	order	22	1	@Nizam Abhi just phone kiya but unhone phone receive nahi kiya.	2026-03-07 09:03:35.064	\N
34	order	24	5	@Qamar is ka followup le lo	2026-02-24 05:24:31.446	\N
35	order	24	1	@Nizam Dinesh Kasat sir ne call pickup nahi kiye, unko message kiya hun.	2026-02-24 06:13:48.748	\N
36	order	24	1	@Nizam unka reply aaya hai. let me check karke	2026-02-24 06:52:14.515	\N
37	order	24	1	@Nizam Dinesh sir ko call kiya poori bell huvi phone nahi uthaye unhone. text message kiye hain ke I will call you back	2026-03-07 09:07:21.797	\N
38	order	25	1	Cheque Ready Hai	2026-01-29 09:49:42.449	\N
39	order	26	5	is ka invoicing JID 20251213-059 ke saath hi karna hai	2026-01-26 13:33:18.245	\N
40	order	26	4	Mahesh Paper, Invoice No. 4129/25-26	2026-02-11 04:10:13.329	\N
41	order	27	5	Reshma Madam ne kaha hai woh Sir se pooch kar batayeinge	2026-01-26 13:46:29.679	\N
42	order	27	5	Order No.\n#20418	2026-03-23 15:15:16.203	\N
43	order	28	5	Plastic Folder\nSize: Full Scape - Qty: 500 - 5,180.00 + GST\nOld Invoice No. MTPL2425-00093 Dated: 01/07/2024\nNew Rate: 5,700/- + GST 1026/- Total 6,726/-	2026-03-26 08:59:23.19	\N
44	order	28	5	as its print karan hai Plastic Folder Phele Wala Hi Lena Hain Qty 500 Reshma Madam Se Confrim kiya Hon (Kamal)	2026-03-26 09:02:40.891	\N
45	order	28	2	@Nizam Tuseday ko Call kiya tha Madam Bole Zaid Sir se Approval liye nahi hai - Aproval lene ke baad Oder Confirm hoga	2026-04-01 06:09:23.567	\N
46	order	34	5	Balaji Heights  Brochure Re-size, Modifications & Printing (with Inserts and Pocket)  Quantity: 500 Copies Main Brochure: 20 Pages  Brochure Size: 9.5” x 13.5” Paper: 270 GSM Fine Paper  Inserts: 10 Pages Insert Size: 10.5” x 7.5” Paper: 170 GSM Indian Art Paper Printing: Single Side Printed  Special Feature: One Attached Paper Pocket on the 2nd Last Page (to hold the 10 inserts / additional documents)  Total Cost: ₹ 1,38,500/- GST Extra	2026-02-24 05:43:12.829	\N
47	order	34	5	email kiya hai aaj	2026-03-07 05:26:39.56	\N
48	order	34	2	@Nizam Brochure Office par Ready Hai - Subhash sir ko Call kiya tha woh bole Floor Plan ke Saath Delivery karo	2026-03-27 13:46:06.274	\N
49	order	36	1	@Nizam Ganesha Amol ke brochure me last page me jo company ka logo hai.. umse yeh building wala logo dalna rahega and Floor Plan me jo lift likha huwa hai uska alignment sahih karna hai	2026-02-18 10:08:36.362	\N
50	order	36	1	@Nizam yeh logo last page dalna rahega.	2026-02-18 10:11:08.697	\N
51	order	36	1	@Nizam Floor plan me Lift ka text alignment sahih karna rahega.	2026-02-18 11:18:05.183	\N
52	order	36	5	corrections kar ke bhej diya hoon	2026-02-18 11:35:36.669	\N
53	order	36	5	@Qamar is ka followup le lo	2026-02-24 05:23:36.149	\N
54	order	36	1	@Nizam Call kiya tha wo network coverage area me nahi hai isliye baat nahi ho payee, message kiya hun unko.	2026-02-24 06:10:56.073	\N
55	order	36	1	@Nizam Client ne brochure final kiya hai, proforma bhej kar balance payment lena hai.	2026-02-25 07:14:14.323	\N
56	order	36	1	@Nizam Call bhi kiya and whatsapp par message bhi kiya, client reply nahi kar raha hai, whatsapp message seen kiya hai.	2026-03-07 10:03:46.706	\N
57	order	39	5	Isme  *Above Kohinoor Electronics* Ye hata ke  *Near Pakiza Tower Gate* ye daalna hai	2026-01-26 17:46:19.931	\N
58	order	39	4	Printhub, Invoice No: OL-009604/25-26	2026-01-28 06:15:09.706	\N
59	order	39	2	@Nizam  Al ifra Lanyard office par aagya Ha quality best hai	2026-02-23 12:23:18.796	\N
60	order	39	4	Basic Visual ID Technologies, Invoice No. 2025-26/798	2026-02-24 05:51:00.222	\N
61	order	41	4	Printhub, Invoice No: OL-009606/25-26	2026-01-28 06:07:57.098	\N
62	order	42	4	Mahesh Paper, Invoice No. : 4346/25-26	2026-02-10 06:02:51.146	\N
63	order	44	5	Quotation and printing approval given on WhatsApp by Mr. Arsalan.	2026-01-30 04:35:29.944	\N
64	order	45	5	Quotation	2026-02-11 07:43:54.807	\N
65	order	45	5	300 brochures confirmed for print on Imported Paper, confirmed by the Qamar Momin	2026-02-17 10:52:41.291	\N
66	order	45	1	@Nizam HD Elite ki final file upload kiya hun, ek baar aap quality check karke print me share kar dijiye.	2026-02-18 11:49:25.092	\N
67	order	45	2	Santosh Rajesh ko Bola Hon Job Mail kiya Hai	2026-02-19 06:41:22.743	\N
68	order	45	2	Sona Paper main Phone karke Bol diya hon Paper bhejne	2026-02-19 06:43:54.674	\N
69	order	45	2	Brochure Tuesday ko Milega 24-02-26 santosh se Confrim kiya hon	2026-02-20 05:32:03.404	\N
70	order	45	4	Sonafine, Invoice No. MUGST25/3009571	2026-02-21 03:08:23.872	\N
71	order	45	2	Transport Charges 1100/- Taxi Fare byculla to Taloja Main HMD Office Ak Orion	2026-02-24 08:48:20.331	\N
72	order	45	4	Rajesh Printouch, Invoice No. 7541/2025-26	2026-03-02 03:31:09.519	\N
73	order	46	5	@Qamar is ka status Review bata raha hai, job review ke liye kab bheje hain woh date likh do yahan par aur followup le lo	2026-02-24 05:23:02.698	\N
74	order	46	1	@Nizam Unique Avenue ka brochure review keliye 09.02.2026 ko gaya tha.	2026-02-24 06:01:58.4	\N
75	order	46	1	@Nizam iske update keliye Tayib Hamdule sir ko call kiya tha but wo phone receive nahi kiye, whatsapp message kiya hun unko.	2026-02-24 06:03:29.003	\N
76	order	46	1	@Nizam tayib sir ka replya aaya hai ke : thode time me bolta hun	2026-02-24 06:06:50.758	\N
77	order	46	1	@Nizam Sent for proofing	2026-02-27 09:48:01.959	\N
78	order	46	2	@Nizam @Qamar Printing main bheja hon Job aur Sona Paper main Paper ka Boldiya Hon	2026-03-05 06:27:24.535	\N
79	order	48	6	pls update the status @Nizam 	2026-01-31 05:19:53.872	\N
80	order	49	5	Quotation: ₹ 2,000/-	2026-02-02 04:22:15.921	\N
81	order	49	5	1 - Feb 26 - Done\n2 - Mar 26 - going on	2026-03-07 08:22:09.774	\N
82	order	50	5	Selections #13871	2026-01-30 17:45:22.274	\N
83	order	50	6	@Nizam 	2026-01-31 05:17:52.22	\N
84	order	50	4	Selection, Invoice No: 16961	2026-02-04 06:01:20.754	\N
85	order	52	5	Letter Head Quotation  Paper: 120 GSM Ashraf Chowdhary Rs. 6,900/- Qty: 500 Rs. 8,115/- Qty: 1000	2026-02-13 06:28:15.991	\N
86	order	52	5	@Shahjahan kal jo payment aaya hai woh is job ka hai, aap ne 128 me likha hai payment aa gaya hai.	2026-02-27 20:00:07.369	\N
87	order	52	3	Payment ho gaya = 3,500	2026-03-02 04:22:50.937	\N
88	order	53	3	Payment ho gaya = 3,500 	2026-02-27 10:02:07.406	\N
89	order	53	5	ok	2026-02-27 19:46:18.075	\N
90	order	54	5	yeh quotation print mumbai ke price list ke hisaab se nahi hai, kyunki yeh scheme wale job me nahi print ho sakega, wahan print karte hain to delivery 3-4 din me milegi, jb ki hum ko 5 tareekh ki raat me yah 6 tareekh ki subah me kaise bhi delivery karna hai, exhibition hai 6 tareekh ko. is liye Shajahan ne jo quotation is me likha tha mai ne woh delete kiya hai. 	2026-02-04 04:00:24.775	\N
91	order	54	5	@Shahjahan 	2026-02-04 04:01:46.575	\N
92	order	54	5	New Quotation @Qamar 	2026-02-04 04:02:16.669	\N
93	order	54	5	Final quote approved by the client	2026-02-04 07:48:35.543	\N
94	order	54	4	Rajesh Printouch, Invoice No. 7481/2025-26	2026-02-27 04:08:32.887	\N
95	order	55	5	@Qamar in se last kya baat hui is brochure ke baare me?	2026-02-24 05:21:03.107	\N
96	order	55	1	@Nizam Sheetal madam se baat hogayi hai, Raju sir out of station hain, ek hafte baad madam office par aakar discuss karengi kaisa brochure banana hai us par.	2026-02-24 05:59:15.006	\N
97	order	55	1	@Nizam Sheetal madam bole hain ke sir abhi tak aaye nahi hai, aate hain to main aapko call karti hun.	2026-03-07 09:11:17.157	\N
98	order	56	5	Final quote approved by the client	2026-02-04 07:45:58.362	\N
99	order	57	5	Shaykh ne poster banane ka order diya, aur bina bataye unhon ne kahin aur se banwa liya, is liye yeh job archive me daal diya gaya hai.	2026-02-05 09:59:45.457	\N
100	order	58	5	Quotation	2026-02-04 03:55:07.985	\N
101	order	58	5	Final quote approved by the client	2026-02-04 07:47:54.285	\N
102	order	59	5	initial in complete data aaya hai, client se data bhejne bola hoon	2026-02-05 05:26:23.582	\N
103	order	60	5	Payment followup done on Email and Whatsapp	2026-03-07 07:48:47.773	\N
104	order	63	5	yeh bag Vertical banana hai content aapne jo rakhe hain wo sahih hai agar koi ek company ka bada karna hai to HD Builders & Developers ko bada centre me rakh sakte hain and BAYT ka naya logo banana hai naam spelling BAIT rahega. (Qamar)	2026-02-17 10:54:08.082	\N
105	order	63	5	@Qamar is ka logo aap bana do aur bag ki design bhi jaise baat hui hai waise bana do aap	2026-02-24 05:32:08.303	\N
106	order	63	1	@Nizam haan is par already work kar raha hun, aaj kosish karke complete kar dunga InSha ALLAH.	2026-02-24 05:53:44.824	\N
107	order	63	1	@Nizam sent for review	2026-02-25 04:47:31.134	\N
108	order	63	1	@Nizam Bait Builders ke logo ke options share kiya hun Tayib Hamdule sir ko.	2026-02-28 08:34:18.848	\N
109	order	63	1	@Nizam Paper bag me bait ka updated logo dalkar proofing keliye share kiya hun tayib hamdule sir ko	2026-02-28 09:12:10.541	\N
110	order	63	2	Rajesh Print ouch main Confirm kiya hon Qty 500 actual Qty ke liye 100 bag ka Paper Extra Dalna Raheta Hai	2026-03-04 08:07:51.234	\N
111	order	63	2	@Nizam @Qamar Job Print main bheja Hon Sanotsh ko infrom kiya Hon aur Mahesh paper Wale ko bola hon paper Kal Delivery hoga	2026-03-04 10:14:12.163	\N
112	order	63	2	@Nizam Santosh Rajesh se Confirm howa hai Job 12.03.26 ko Milega	2026-03-10 06:17:56.212	\N
113	order	63	2	@Nizam Paper Bag Ready hai Byculla Main - Direct Delivery kar rah hon Taloja Office par	2026-03-14 05:47:49.221	\N
114	order	63	2	@Nizam paper Delivery ke time Tayib Hamdule bola hai Eid baad Teen Bill ka Payment karega	2026-03-15 12:45:44.777	\N
115	order	64	5	Sticker Rera number stickers with half cutting	2026-02-09 13:51:31.264	\N
116	order	67	2	@Nizam Al ifra ka Laynyard Delivery hogya hai - Mohammad Frooque ne Collect kiya Hai - Poter Charge 221/-	2026-02-24 10:04:42.466	\N
117	order	67	1	@Nizam Feedback from Client : We have received the lanyards, and this time the quality and design are truly impressive. Thank you for your dedication, effort, and consistent support.  A special thanks to Shemoil for clearly understanding our requirements and for the excellent coordination throughout the process. Your professionalism and commitment are highly appreciated.  Jazakallah khair	2026-02-25 07:19:30.457	\N
118	order	68	5	@Qamar in ka correction kar do	2026-02-18 06:36:38.386	\N
119	order	68	1	@Nizam okay	2026-02-18 10:00:59.931	\N
120	order	68	5	@Qamar is me update karo last kya baat hui hai	2026-02-24 05:30:40.987	\N
121	order	68	1	@Nizam usne humko jo correction bola tha karne wo karke update kar diya hun.. unki taraf se do AI image aane wali hai, ek Shivaji Maharaj Ki image and ek Founder ki image generate karke dene wala hai.	2026-02-24 05:52:16.807	\N
122	order	68	1	@Nizam Sent for review	2026-02-25 04:48:25.895	\N
123	order	68	1	@Nizam Profile Printing Qoutation Sent	2026-02-25 07:36:34.934	\N
124	order	68	1	@Nizam Sent for review	2026-02-28 06:40:09.734	\N
125	order	68	1	@Nizam Raj Lotankar sir ko SAI MANNAT ka brochure kaafi achha lag raha tha, usi hisaab se colour combination rakhne bole they, wo karke client ko share kar diya hun.	2026-02-28 06:51:09.666	\N
126	order	69	5	@Qamar follow-up le lo in se	2026-02-18 06:36:01.419	\N
127	order	69	1	last time phone kiya tha, phone recieve nahi kiye they, aaj wapas se call karta hun.	2026-02-18 10:00:18.606	\N
128	order	69	5	@Qamar follow-up	2026-02-24 05:19:23.908	\N
129	order	69	1	@Nizam inse baat kiya hun, wo bole hai aaj final karta hun, aapko phone karta hun.	2026-02-24 05:51:08.151	\N
130	order	69	1	@Nizam Mohan Pokar sir se baat huvi hai aaj, bole hain ke print ka decision abhi tak aaya nahi tha, final karwata hun.	2026-04-01 05:47:14.627	\N
131	order	70	5	@Kamal yeh job kab milega update karo	2026-02-18 06:35:29.902	\N
132	order	70	2	Visiting Card Parso milga Bombay se	2026-02-18 10:43:14.087	\N
133	order	70	2	Aaj call kia Naeem Patel ko Woh bole aaj bandh rahega tu bhi Madam ko Call karo aagr woh aaye honge tu Delivery kar dena nahi tu kal Bhejdo Phone kar ke	2026-02-20 05:42:51.685	\N
134	order	70	4	Madhuri Prints, Invoice No. MP/25-26/1876	2026-02-24 06:10:30.038	\N
135	order	72	5	@Qamar is ka follow-up le lo	2026-02-24 05:18:40.592	\N
136	order	72	1	@Nizam yeh client ko humne jo bana kar bheja tha usko pasand nahi aaya halanke usne hi aisa bataya tha banane, Client ne ek hafte ka time diya hai, but problem yeh hai ki usne jaisa logo banaya hai usko waisa hi similar aur achha chahiye, aaj us wapas se baat karta hun.	2026-02-24 05:49:08.772	\N
137	order	73	3	Farooque Qazi sir bole  hain ke aap yeh design kijiye, main aapko final size share karta hoon, aur G +4 wale sabhi project nikalna hai aur Radha Niwas & Ideal Residency project add karna hai.”	2026-02-12 06:37:47.567	\N
138	order	73	5	@Qamar is ka bhi follow-up le lo.	2026-02-24 05:14:32.195	\N
139	order	73	1	okay	2026-02-24 05:32:02.402	\N
140	order	73	3	New Size 48 × 36 inch	2026-02-24 08:48:52.813	\N
141	order	73	1	@Nizam working on it	2026-02-25 10:41:19.077	\N
142	order	74	2	Dr Chafale Receipt aaj 2:00 se 3:00 Baje tak Ready Hogi Babu seth ke Pass	2026-02-18 08:00:40.019	\N
143	order	74	2	Dr. Vishal Chafale Ki Receipt Ready Hai - Kal Morning main Poter Se Mangwata Hon	2026-02-18 10:06:41.654	\N
144	order	74	3	Dr. chafale ki clinic per visiting Card deliver kar diye hai . Phone kar k confirm bhi kar diye hai.	2026-02-19 09:26:01.841	\N
145	order	75	5	1st tme website ke package me domain aur hosting include rahta hai, us ke baad 2 baar domain aur hosting renewal ho chuka hai, Website ka 59,000/- ka quote diye the us me 2 saal ka domain aur hosting ka amount add karna hai 2nd year ka ₹ 5,200/- aur 3rd year ka ₹ 5,980/-	2026-02-17 06:03:08.689	\N
146	order	75	5	aaj content ke liye whatsapp kiya hoon	2026-02-17 06:03:23.216	\N
147	order	75	5	Madam ne kaha hai, woh travel me hai, next week me content deinge	2026-02-18 06:33:01.512	\N
148	order	75	5	Good Morning Ma’am,  Kindly share the website corrections and updated content at your convenience. Thank you. | message sent today	2026-02-24 05:13:43.75	\N
149	order	75	5	followup done	2026-03-07 07:55:23.794	\N
150	order	76	2	GRK Visiting Card Correction - Nilesh Patel - Rajiv Kurup - Kumar Kurup - ye Teeno Naam Dal kar Wapas PRoofing karta Hon	2026-02-18 06:43:07.075	\N
151	order	76	2	Visiting Card Main Color Same Chahiye Client ko - Client ko Bola Hon Sample Lagega - Sample Dekhne ke Baad phir Cleint ko Samjhana Rahega ke Color 19:20 hota Hain print hone main	2026-02-18 08:09:14.756	\N
152	order	76	2	GRK ki Office se Madam call kithi VC ka File PDF main karke bhejo Font clarity check ke liye tu Bhej diya Hon	2026-02-19 06:33:56.232	\N
153	order	76	2	@Nizam Nilesh Patel GRK ka Visiting Card Final Kiya Hai Quotation Bhejna Hai 	2026-02-19 08:10:45.738	\N
154	order	76	2	 1) Nilesh Patel Qty 2000 2) RAJIV KURUP Qty - 1000\n3) KUMAR KURUP - Qty 1000	2026-02-19 08:12:58.411	\N
155	order	76	2	Quotation 1000 Card ₹ 2,270/- + GST extra 2000 Card ₹ 4,100/- + GST extra ye Quotation diye hai - Client Rate kam karne Bol rah Hai	2026-02-19 10:16:02.29	\N
156	order	76	5	8,000/- me final kiya hai client	2026-02-20 05:29:38.231	\N
157	order	76	2	Job Bafna card main bhej diya hon	2026-02-20 11:13:31.464	\N
158	order	76	2	@Nizam GRK infra ka visiting card first half main delivery kardeta ho - color main variation aaya hai Front side main jiyada farak nahi hai but back side color variations aaya hai	2026-02-27 04:05:15.499	\N
159	order	76	2	@Nizam GRK Infra ka Visiting Card Delivery hogaya Hai Cheque Payment Ready Hai 3:30 baje Collect karna Hai Poter se Mangwa leta Hon Bike Office par Nahi Hai	2026-02-27 09:44:59.353	\N
160	order	77	3	₹ 4,200/- for 500 letterheads - Delivery: Next day ₹ 1,680/- for 500 letterheads - Delivery: 5-7 days	2026-02-17 10:31:58.623	\N
161	order	77	4	Print Plaza, Invoice No. 2025-26/2556	2026-02-18 03:59:26.452	\N
162	order	77	3	Waiting Pickup	2026-02-18 07:33:48.46	\N
163	order	78	2	job printing process main Gaya Hai - Thermal Lamination ka Remind kiya Hon aur Lamination ukhad jata Hai woh Bola Hon - Woh bole client handling ke upar hai woh kesa use karata Hai baki woh - aur Jahan Folding Creasing woh par Lamination Fold Line Dikhega\n	2026-02-18 06:31:22.05	\N
164	order	78	2	Prestige Graphic main Follow up kiya tha - Paper aane ke Baat Status Batayegain kab milega	2026-02-19 06:39:14.415	\N
165	order	78	2	@Nizam Coffee table Book Monday ko Milega Prestige Graphics se	2026-02-21 06:24:42.804	\N
166	order	78	2	@Nizam Coffee table Book Read how hai Poter se Office Par mnagwa rah hon phire Quality Check karne ke Baad Client ko Phone kar ke Confrim karta Khud collect karega Ya Poter karna hai	2026-02-23 06:04:23.926	\N
167	order	78	3	Vender to office porter charge  326   Office to Client porter charge    149	2026-02-23 10:10:34.317	\N
168	order	78	4	Prestige Prints, Invoice No. 284	2026-02-24 03:32:23.907	\N
169	order	79	1	Humne client ko yeh qoutation diye hai. 	2026-02-18 10:36:10.267	\N
170	order	79	1	Mr. Dwijen Mehta Envelope Size: 10x14 inch  - Qty: 500          ₹ 8,535/- Discount ₹ 375/- Final Price ₹ 8,160/- Size: 10x14 inch  - Qty: 1000        ₹10,145/- Discount ₹505/- Final Price ₹ 9,640/- Designing ₹ 1,000/- GST Extra	2026-02-18 10:36:23.083	\N
171	order	79	5	Design sent for review	2026-02-23 08:25:13.895	\N
172	order	79	5	mofications done and sent to review	2026-02-24 05:01:33.048	\N
173	order	79	1	@Kamal Final Qty: 1000 each	2026-02-27 06:30:00.256	\N
174	order	79	2	@Nizam Sent to Printing Selection Oder Number - #17603 - Life space Envelops Size 10x14 Qty - 1000	2026-02-28 08:59:48.741	\N
175	order	79	2	@Nizam Sent to Printing Selection Oder Number - #17602 - Life space Envelops Size 9.5x4.5 Qty - 1000	2026-02-28 09:01:19.746	\N
176	order	79	2	@Nizam Dwijen Mehta se Confirm howa hai Job Ghatkopar Delivery karna Hai, woh Jumma Baad Porter karta hon	2026-03-06 06:04:51.827	\N
177	order	79	2	@Nizam Life Sapce Group ka Job Poter kiya Hon aur Proforma bhi diya hon	2026-03-06 08:55:45.227	\N
178	order	79	3	@Nizam life space ka envelop job deliver ho gaya hai aur  Rakesh se baat hui hai job mil gaya hai	2026-03-06 09:43:27.555	\N
179	order	80	3	10x27 CM, Four Fold, 100 ,200 ,300 ka Quotation dena hai. Imported Paper Digital prints	2026-02-19 07:10:22.399	\N
180	order	80	5	Quotation	2026-02-20 06:12:13.922	\N
181	order	80	1	@Nizam Yeh client ko main phone kiya tha, wo bola hai ki me office mai nahi hun, office jaonga to check karta hun.	2026-02-20 09:01:35.176	\N
182	order	80	1	@Nizam abhi call kiya tha main Mukesh sir ko unhone kaha hai ki main qoutation check kiya hun lekin mere daddy out of town hai wo aate hain to main aapko ek se do din me batata hun.	2026-02-24 05:41:35.1	\N
183	order	80	1	@Nizam iska Rs.: 1,500/- advance aaya hai, designing ka Wednesday evening ka time diya hun. content usne jo bheja hai wo same rahega.	2026-02-28 07:05:13.777	\N
184	order	80	1	@Nizam Mukesh sir ko call kiya tha wo march ending me busy hain, free ho kar saamne se call karenge wo humko.	2026-04-01 07:04:25.331	\N
185	order	81	1	@Nizam iska design final hai, but content correction and proofreading client check karke batayega.	2026-02-24 05:38:15.448	\N
186	order	81	1	@Nizam Corrections : New Key Layout Plan, C Wing floor plan dalna hai, and flat ke separate separate plan dalna hai, client flat number batane wala hai, cut flat plan ke saamne garden view, city view and sunset view show karna hai	2026-02-28 06:48:40.39	\N
187	order	81	1	@Nizam Coffee Table ka cover white rahega, and logo and Sanskrit Slogan in embossed golden sticker 	2026-02-28 06:49:33.56	\N
188	order	81	5	₹55,500/- me ₹ 3,500/- ka discount de sakte hain, Final Amount ₹ 52,000/- hoga @Qamar	2026-03-13 06:17:43.555	\N
189	order	81	2	@Nizam Coffee Table Book ke liye 25x36 Imported paper 270gsm Qty 45 sheet Lagega size 25x36	2026-03-14 08:08:36.601	\N
190	order	81	2	@Nizam coffee table Book ka Paper prestige Graphics main delivery hogaya hai	2026-03-14 12:03:33.667	\N
191	order	81	2	@Nizam Coffee Table Book 23-03-26 ya 24-03-26 ko Ready Hoga Prestige Graphic main	2026-03-17 05:57:57.416	\N
192	order	81	2	@Nizam Jagruti Se Sticker Porter kar ke Prestige Graphic main Bhej Deta Hon	2026-03-17 05:58:46.704	\N
193	order	81	2	@Nizam Job Prestige main Ready hai - Porter Se Mangwa ta Hon	2026-03-23 05:44:36.278	\N
194	order	81	2	@Nizam Coffee Table Book office par Ready Hai - Ep Sticker Pasting kar ke Ready karta Hon	2026-03-23 10:38:01.434	\N
195	order	82	1	@Nizam malti madam ko call kiya but wo receive nahi kiye phone, aap designing ka proforma bana kar share kar dijiye.	2026-04-01 06:57:47.892	\N
196	order	84	5	@Kamal is me Autocad ki file hai aur PDF file bhi, ek baar PDF se check kar lena ki auto cad aur PDF dono same hai ki nahi, agar same hai to yeh plan karna rahega.	2026-02-21 13:05:12.748	\N
197	order	84	2	@Nizam Abu Faiz Se baat Hwui - PDF aur Cad Ka Different Batay hon - Woh bole Mail main ju Cad ki File hai us par Working karna Hai 	2026-02-23 09:48:12.467	\N
198	order	84	2	@Nizam Floor Plan Par working chalu Hai	2026-02-24 05:40:18.853	\N
199	order	84	2	@Nizam Floor plan Complete howa hai upload kiya hon	2026-02-26 10:53:01.311	\N
200	order	84	5	OLD QUOTATION\n--------------\nAbri Crystal Brochure Designing & Printing\nSize: 9"x13"\nPages: 20\nPaper: Cover 270+160=430 GSM (Imported)\nPaper: Inner 160+160=320 GSM (Imported)\nAll Pages Varnish\nUV ON Cover and Last Page\nBack to Back Pasted\nQty: 1000\n₹ 2,28,950/- (GST Extra)\n--------------\nPAPER BAG\n₹ 45,000/- for 1000 bags for the brochure \nGST Extra	2026-03-09 07:32:08.835	\N
201	order	84	2	@Nizam brochure Dummy ready hai Floor plan cutting & Folding baki hai Monday ko abu Faiz ko call karta hon	2026-03-14 12:09:03.266	\N
202	order	84	2	@Nizam abry crystal Brochure last page main contact number galat hai abu faiz ne bola hai	2026-03-17 04:23:03.039	\N
203	order	84	2	@Nizam insertion Floor plan Booklet type main karna hai size Horizontal -	2026-03-17 04:24:04.346	\N
204	order	84	2	@Nizam Floor Plan main Car parking ka Correction aaj karne wala hon- 17-03-26	2026-03-17 04:24:45.09	\N
205	order	84	2	@Nizam Abu Faiz ko Letter Head ke Liye Call kiya tha, tu Woh Brochure ka Bole Final hai , Contact Number, 2 log ka aayega, Marketing wale ka aur Abu Faiz ka, marketing  Wale ka Number aane Wala Hai, aagar Number aane main Let hoga tu sirf Abu Faiz ka Number Dal kar Print karna Rahega, Number	2026-03-20 07:14:31.81	\N
206	order	84	2	@Nizam Site Address :\nAbri Crystal\nSurvey No. 111/1, At : Taloja Manjkur, Tal : Panvel, Dist: Raigarh, Pin- 410208\nCall: +91 96196 20277 / 9920554786 \nhttps://maps.app.goo.gl/BYSg3WtmfwGHaqcC7?g_st=ic	2026-03-23 11:33:11.021	\N
207	order	84	5	Brochure me aur bhi corrections the woh aaj kar ke bheja hoon, abhi client ki side se 2 din ke hold par hai, woh "Codename" dene wale hain	2026-03-24 06:59:36.258	\N
208	order	84	5	Printing me bhej diya hoon, PO Nos. PO2526-0107 & PO2526-0108	2026-03-26 05:54:48.074	\N
209	order	84	5	4mm spine badha kar cover page ki file wapas se email kiya hoon.	2026-03-27 08:22:13.479	\N
210	order	84	5	Printing Order\nJob Name: Abri Crystal \nJob Type: Brochures\nPages: 16\n\nClosed Size: 9” x 13” Open Size: 18” x 13”\nQuantity: 600 Copies\nBack to Back Pasting\n———\nPaper Details\nCover Pages \nPaper: INSPER M-Rough (Montblanc) Extra White GSM: 270 GSM Sheet Size: 72 x 102 cm Supplied sheets: 175 Sheets\n———\nInner Pages \nPaper: INSPER M-Rough (Montblanc) Extra White GSM: 160 GSM Sheet Size: 72 x 102 cm Supplied sheets: 1225 Sheets\n———\nPocket (Fabrication) Paper: 270 GSM Sheet Size:  72 x 102 cm Supplied sheets: 35 Sheets\n———\nPaper Supplied by: US\nVarnish: All pages high gloss varnish\nUV: UV on cover page as per file provided seprately\nFabrication: Pocket pasting on 2nd last page\nDelivery: As early as possible.	2026-03-29 09:08:11.887	\N
211	order	84	5	Printing Order\nJob Name: Abri Crystal Floor Plan Booklet \nJob Type: Floor Plan Booklet\nPages: 16\n\nClosed Size: 11” x 7.5” Open Size: 22” x 7.5”\nQuantity: 600 Copies\n\nPaper Details: Indian Art Paper GSM: 170 GSM Sheet Size: 58.4 x 91.4 cm Supplied sheets: 700 Sheets\nFabrication: Central Pining and Final Cutting	2026-03-29 09:16:49.496	\N
212	order	85	5	Sent to print	2026-02-25 07:18:42.67	\N
213	order	85	2	@Nizam Brochure Delivery ke Liye Nikal Rah Hai aur Direct Planet ki Office main Taxi wala Dedega Delivery 	2026-03-02 06:12:16.228	\N
214	order	86	1	Monarch Brookfields - Planet Builders   Visit Form Size : A4 Printing : Front Back Qty: 100 Paper : 100 gsm Alabaster	2026-02-25 09:41:04.3	\N
215	order	86	1	Monarch Brookfields - Planet Builders   Booking Form Size : A3 Printing : Front Back Qty: 100 Paper : 100 gsm Alabaster Pages : 2 Centre Folding	2026-02-25 09:41:21.516	\N
216	order	86	1	@Nizam sent it to lipica prints	2026-02-25 09:41:50.76	\N
217	order	86	2	@Nizam @Qamar Job kal First half main ready hoga Poter se mangwa leta hon	2026-02-25 10:58:06.652	\N
218	order	86	4	Lipica Print, Invoice No. MH/797/2025-26	2026-02-27 04:03:37.371	\N
219	order	86	5	Costing for Invoicing @Qamar GST Number mangwa kar invoicing karwa do.	2026-02-27 19:18:59.564	\N
220	order	87	1	Material: Durable 250 GSM Indian Art Paper Finish: Matt Laminated (Outer Side) Printing: Full-color printing (Same design on both sides included. Different design on each side will be charged separately.) Size: 16” × 11” × 3”  Price (GST Included): 500 Bags – ₹28,615- 1000 Bags – ₹48,130/-	2026-02-28 07:03:16.029	\N
221	order	87	1	@Nizam iska design banana rahega	2026-02-28 07:03:25.581	\N
222	order	87	5	@Qamar kuch bataya hai client ne kaisa design chahiye, sirf logo rahega ya aur kuch bhi rahega	2026-02-28 08:43:19.669	\N
223	order	87	1	@Nizam Arsalan Ansari sir ko aaj call kiya tha but wo phone nahi uthaye, whatsapp message kiya hun.	2026-04-01 06:51:55.045	\N
224	order	90	1	@Nizam Aaj 11.03.26 ko main Raj Lotnkar sir ko message kiya tha regarding profile printing, unhone kaha hai ki unko kisi urgent kaam se Gaon jana pada hai.	2026-03-11 06:10:39.321	\N
225	order	90	1	@Nizam Company Profile me kuch changes/correction aane wala hai, kuch project wagerah ya other details unko ad karna hai, but uske liye thoda wait karne bole hain around 1 month jayega. saamne se wo humen call karenge do se teen pehle.	2026-04-01 06:50:00.981	\N
226	order	91	5	Quotation:\nBrochure Designing\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF, JPEG\nPrice: ₹24,000\n\nBrochure Printing\nOption 1:\nIndian Art Card, 350 GSM\nCover page Matt or Gloss Lamination\n₹24,870 for 100 copies\n₹30,665 for 300 copies\n\nOption 2:\nFine Imported Paper, 270 GSM\nAll pages Eco-friendly Aqua Varnish\n₹33,645 for 100 copies\n₹48,945 for 300 copies\nPrices include 18% GST.	2026-03-02 12:03:11.15	\N
227	order	91	1	@Nizam Inka Brochure Designing Me Sirf Cover Page Ready Huwa Hai, Inko followup karna hai kiya apni taraf se regarding advance payment.	2026-03-23 07:08:51.159	\N
228	order	91	1	@Nizam Hannan Kashimir  sir ko call kiya tha, but wo call pickup nahi kiye. whatsapp message karta hun.	2026-04-01 06:42:33.458	\N
229	order	91	1	@Nizam Inka reply aaya hai, wo travel me they, aayenge jab bhi time milega.	2026-04-01 07:22:43.265	\N
230	order	93	5	Big Size Envelope Quotation. Yeh sirf Printing ka quotation hai, PDF banate waqt Designing bhi add karna hai.	2026-03-07 20:49:25.663	\N
231	order	93	5	Drillboss\n₹ 3,000/- Stationery Designing\n₹ 2,065/- Visiting Card - 500\n₹ 10,950/- Letter Head 105 RZ - 1000 \n.........................\n₹ 16,015/- Total Amount\n₹ 815/- Discount\n₹ 15,200/- Final Amount	2026-03-16 12:11:55.514	\N
232	order	93	5	@Qamar in ka last update kya hai	2026-03-20 19:14:25.697	\N
233	order	93	1	@Nizam Ashraf Chowdhary sir ko call kiya tha, but wo call pickup nahi kiye. whatsapp message karta hun.	2026-04-01 06:41:02.576	\N
234	order	95	5	in ka last update kya @Qamar	2026-03-20 19:13:53.135	\N
235	order	95	1	@Nizam Company Profile me kuch changes/correction aane wala hai, kuch project wagerah ya other details unko ad karna hai, but uske liye thoda wait karne bole hain around 1 month jayega. saamne se wo humen call karenge do se teen pehle.	2026-04-01 06:39:17.854	\N
236	order	97	1	@Nizam Iska billing details keliye Sheetal Umale madam ko message kiya hun.	2026-03-23 07:19:05.204	\N
237	order	98	1	@Nizam Client ne pehle wall branding par kaam shuru karne bola hai, wall branding ka hone ke baad phir brochure start karna hai.	2026-03-23 07:15:28.775	\N
238	order	98	1	@Kamal Iska Floor Plan aap shuru kar sakte hain, aapke schedule ke hisaab se.	2026-03-23 07:15:59.728	\N
239	order	98	1	@Nizam iska design to aap kar chuke hain, final floor plan kamal bhai karke client ko share kiye hain floor plan colour combination approval keliye.	2026-04-01 06:36:18.499	\N
240	order	99	5	@Qamar in ka 20,000/- advance aaya hai, to check kar lo un ka kaun sa job 1st priority hai, phone kar ke baat karlo, aur usi hisaab se lineup karo.	2026-03-20 19:13:29.147	\N
241	order	99	1	@Nizam Inko phone kiya tha, wo aaj kal me final correction batane wale hain.	2026-04-01 06:35:20.066	\N
242	order	100	2	@Nizam Letter Head ka Correction whatsapp par aaya hai, add & Phone number shelter Builder ki niche lena hai , aur Logo ka Water mark dalna hai - Monday ko karta hon	2026-03-14 12:17:29.114	\N
243	order	100	2	@Nizam job Final hai - Quotation approval baki hai kal call kiya tha madam bole check kar ke batayegain	2026-03-19 04:13:18.275	\N
244	order	100	2	@Nizam Letter Head Job & Quotation Qty - 500 Final Howa Hai Print main Bhej Rah hon	2026-03-23 07:14:57.158	\N
245	order	100	2	@Nizam Job Print main Gaya Hai Selection Order No.\n#20393	2026-03-23 10:50:48.107	\N
246	order	101	3	24000         2000 Discount diye hai aur 22k me Gst include hai	2026-03-11 08:00:04.604	\N
247	order	101	5	In ko deadline kya diya hua hai @Qamar	2026-03-12 17:03:00.994	\N
248	order	101	5	@Qamar in ka last update kya hai.	2026-03-20 19:12:21.438	\N
249	order	101	1	@Nizam Inko aaj message kiya tha unka reply aaya hai. Wo out of town hain, humen update karne wale hain.	2026-03-23 07:04:29.634	\N
250	order	101	1	@Nizam Inko phone kar raha hun par continues busy bata raha hai, whatsapp message kiya hun.	2026-04-01 06:34:41.73	\N
251	order	101	1	@Nizam Inka replya aaya hai, bole hain "I will update"	2026-04-01 12:36:20.078	\N
252	order	102	5	@Qamar in ko kya rate lagate hain design ka? Aur yeh sirf designing ka job hai ya printing bhi hai?	2026-03-13 00:59:42.232	\N
253	order	102	1	@Nizam Check karke batata hun aapko.	2026-03-13 05:10:34.841	\N
254	order	102	1	@Nizam aaj inko payment reminder message kiya hun.	2026-04-01 06:28:30.003	\N
255	order	104	2	@Nizam Job Printing main Bheja Hon - Pad Binding	2026-03-14 06:57:10.405	\N
256	order	104	2	@Nizam Dr Faris Letter Head Vashi se 18-03-26 ko Milega - Order Details#19387	2026-03-17 05:56:06.713	\N
257	order	105	2	@Nizam  Job print main bhejne wala hon 17-03-26	2026-03-17 04:21:41.878	\N
258	order	105	2	@Nizam Job Selection main Print main Bhej diya hon - Order Details#19713 - Delivery Date 23-03-26	2026-03-17 05:44:43.678	\N
259	order	105	2	Selection Job Full Detail in image Attach	2026-03-17 05:48:19.222	\N
260	order	105	2	@Nizam Supermax main Komal Madam Se Baat kiya tha, Letter Head Collect ke liye Woh Bole Saturday Collect karegain, Main unko Bola hon Office Closed hai Monday ko Collect karlo - Proforma Invoice Whatsapp kardiya hon Collect karne ke time Cheque Lekar aane Wale hai	2026-03-20 07:11:41.468	\N
261	order	105	2	@Nizam ye Job Rajneesh ne Office Par aakar Legaya Hai aur Cheuqe Dekar gaya Hai	2026-03-23 07:04:54.726	\N
262	order	106	1	@Nizam Majid Patel sir ko message kiya hun, regarding finalization of flex print or design.	2026-03-23 07:13:26.468	\N
263	order	108	2	@Nizam sale display new elevations add karke kruti madam ko proofing main bhejna hai baki kaam ki priority ke hisaab ye baad main karta hon	2026-03-19 04:22:52.966	\N
264	order	108	1	@Kamal Just reminder.	2026-03-23 07:10:25.369	\N
265	order	108	2	@Nizam ispar Working kar Rah hon aaj Proofing main Bhejta Hon	2026-03-25 12:05:37.296	\N
266	order	108	2	@Nizam Sale Dispay ka Follow Up liya Tha Kruti Madam Se - Design Final Hai - Floor Plan Main kuch Correction hai Woh batane Wale Hai	2026-04-02 07:15:47.301	\N
267	order	109	2	@Nizam Letter Head Print main Bheja Hon Selection Job ID- #19743 - Delivery - 23-03-26	2026-03-17 08:10:37.593	\N
268	order	109	2	@Nizam Abu Faiz ko Call kiya tha Lette Head Ready hai- woh Monday ko Collect karegain	2026-03-20 07:08:59.588	\N
269	order	109	2	@Nizam Abu Faiz collected the letter head from the office himself.	2026-03-24 07:48:15.864	\N
270	order	109	2	@Nizam Abri Realty Letter Head ka Shelter Office main Delivery Kar diye Hain with Proforma Invocie	2026-03-26 08:48:48.059	\N
271	order	111	2	@Nizam Plastic Folder ka Sample F type wala shivam plastic se mangwana hai aur Reshma madam ko sampling karwana hai	2026-03-19 04:04:06.29	\N
272	order	111	2	@Nizam Two Option Available only T type Plastic Folder & F Type Plastic Folder, F Type se Niche ka Sample Nahi aata Hai, Baki Type ka Sample appne Pass Hai	2026-03-23 07:13:31.895	\N
273	order	111	1	@Kamal iska shayed kal aap madam se kuch baat kiye they, wo comment me update kar dijiye	2026-04-01 06:06:13.305	\N
274	order	112	2	@Nizam aaj job printing main bhejne wala hon	2026-03-19 04:00:36.728	\N
275	order	112	1	@Kamal Visiting Card sirf Darshan Singh ka rahega, and wo usme UV wagerah ka bhi set kar dijiye.	2026-03-19 05:33:30.433	\N
276	order	112	2	@Nizam Selection Job Oder No\n1 - order #20003 - Letter Head Qty - 500\n2 - order #20004 - ENVELOPE 9.5 X 4.5 Qty - 500\n3 - order #20012 - Altamott Letter Head (Receipt) Qty - 500	2026-03-19 08:28:37.917	\N
277	order	112	2	@Nizam Bafna Card Job Name: Altamontt Realty Sirf Darshan P Singh ka hi bheja hon\nCode : 2S - D2 \nJob Type: Visiting Card\nQty.: 1000 - Printing main bhej diya hon	2026-03-19 08:29:36.445	\N
278	order	112	1	@Nizam @Kamal Vashi Selection and Fort Selection Me Yeh Job Ready Hai.	2026-03-23 07:09:55.841	\N
279	order	112	2	@Nizam Receipt Book Fort main Binder ke Pass Hai - Woh Ready hogi tu Sabhi Job ek Saath Porter se Mangwata Hon	2026-03-23 10:44:06.088	\N
280	order	112	3	@Nizam Letter Heads - 500  Ready at office\nEnvelope - 500  Ready at office	2026-03-25 12:00:54.071	\N
281	order	112	2	@Nizam Receipt & Visiting Card Also Ready, Stationery items Pura Ready Hai	2026-03-27 13:11:01.497	\N
282	order	114	1	@Nizam yeh brochure design final hogayi hai, Brochure printing ka qoutation share kiye hain, aur ek dummy prestige graphics me bheje hain.	2026-04-01 06:04:32.294	\N
283	order	114	1	@Nizam iska dummy prestige me ready hai, kal subha mangana rahega.	2026-04-01 12:35:15.789	\N
284	order	114	2	@Nizam Client Brochure ki Dummy lekar Gaya Hai	2026-04-02 11:51:39.632	\N
285	order	115	1	@Nizam aaj Swapnil Kalyankar sir ko call kiya tha, but unhone phone receive nahi kiya.	2026-04-01 06:03:32.87	\N
286	order	115	1	@Nizam Unka call aaya tha baat hogayi hai, yeh input diye hain wo Object or Elements we can use:\nCircle\nWater Wave\nand etc.\n\nColor Combination\nRed\nYellow\nBlue	2026-04-01 06:48:47.147	\N
287	order	116	2	@Nizam Both job Envelopes & Letter Head in Printing	2026-03-25 12:00:36.912	\N
288	order	116	2	@Nizam Letter Head Packing ke Baad Delivery Karna Hai, Accounted se Confirm karna Hain Job kahan Bhejna Hai, Mostly Ajaye Deep CHS, main dete Hai	2026-03-30 05:42:48.047	\N
289	order	116	2	@Nizam job Ajay Deep CHS, Main Delivery hogaya Hai,	2026-03-30 10:23:26.054	\N
290	order	119	2	@Nizam Letter Head ka Correction karke Proofing mein Bhejta hon	2026-03-27 13:47:18.842	\N
291	order	119	2	@Nizam Job Print main Bhej Rah Hon	2026-03-28 06:00:36.584	\N
292	order	119	2	@Nizam Selection Vashi ye Job Order #21079 - 1-04-26 ya 02-4-26 ko Milega	2026-03-31 07:14:17.714	\N
293	order	120	2	@Nizam Kal Fort se Job aane Wala Hai uske Saath Mangwata Hon	2026-04-01 14:32:16.385	\N
294	order	121	1	@Nizam Aaj deneb me Joyline Giselle Fernandes madam ko call kiya tha but unhone phone nahi uthaya.	2026-04-01 05:52:14.929	\N
295	order	121	2	@Nizam VC Kal Reday karwa ke Direct CBD Belapur Office bhejta Hon	2026-04-01 14:35:26.76	\N
296	order	121	2	@Nizam ye Job Urgent Basis par kar ke diye Hai un ka Hotel tunga Mein Meeting tha 2:30 Baje aur Hamne 2:10 par dediya Joyline Madam ne Thank U bola Hai	2026-04-02 10:55:39.269	\N
297	order	122	2	@Nizam For Booking contact \nFeroz khan \n9049621965\nSheroz Khan \n72767 79619\nAbdur Rehman Fakih \n8793535115\nAddress :Shirin Fakih complex,near babu chuwni wala Market opposite  Asma masjid, Dargah road Bhiwandi 421302	2026-04-03 04:38:44.318	\N
298	order	122	2	@Nizam Amenities Meet Avenue ki Dala na hai us main 2 se 3 point mein correction hai, Feutures :Near us: Asma masjid and girls madrasa \nFakih English school \nBabu chuwni vegetable and fruits market \nATMs \nNayra petrol pump \nAl moin hospital \nEtc	2026-04-03 04:41:20.102	\N
299	order	122	2	Site Address: https://maps.app.goo.gl/4Q1W1ZZk7jXJ4Mzi7	2026-04-03 04:43:12.961	\N
300	task	11	5	@Qamar kindly update this	2026-03-09 05:02:51.914	\N
301	task	11	1	@Nizam 05.03.26 ko Malti Shejwal madam se update liya tha wo bole hain ki yeh week me print order karenge.	2026-03-09 06:58:56.414	300
302	task	11	1	@Nizam Aaj Malti madam ko banner and pole kiosk me correction karke share kiya hun, kal print ka order dene wale hain.	2026-03-18 06:00:57.95	\N
303	task	18	1	@Nizam Abhi call kiya tha Arjun sir ko, bol rahe they ki main aapka payment kal kar raha tha lekin network issue ki wajah se hua nahi kyunke main Khopoli me tha, aaj pakka hojayega aapka payment.	2026-03-09 07:07:20.137	\N
304	task	18	5	OK	2026-03-09 07:09:38.322	303
305	task	18	1	@Nizam 7K received today.	2026-03-11 07:25:37.015	\N
306	task	19	5	@Kamal Jab hum purani office khaali kiye the us waqt meter ki reading liye the na? woh reading aur us month ka bill check karna hai, Aniket bol raha hai apna bill pending tha. to amount check karna hai kitna bill aya tha aur hum ne last payment kaun se bill ka kiya tha. yeh bhi dekhna hai ki MSEDCL me apna security deposit kitna hai, aur yeh bhi calculate karna hai ki hum ne jo Society ka Metainance bhara tha woh kab tak ka bhara tha.	2026-03-07 17:19:09.548	\N
307	task	19	5	@Kamal yeh check kiye the?	2026-03-12 05:01:05.883	\N
308	task	19	2	@Nizam check karta Hon	2026-03-12 05:35:13.049	\N
309	task	19	2	Miter ka Photo mila hai - Aniket Patel se September ka Bill mangwana Rahega	2026-03-17 06:18:36.057	\N
310	task	20	5	agar interakt ka solve nahi hota hai to AiSensy ke baare me sochna padega.	2026-03-07 17:48:29.844	\N
311	task	20	5	pls. chck	2026-03-07 18:21:27.843	310
312	task	20	6	Do the comments work?	2026-03-09 21:54:50.565	\N
313	task	25	2	Plan ko Hold par rakkho Bajaj School ka Urjent Hai	2026-03-07 09:46:41.988	\N
314	task	25	5	Ok	2026-03-07 17:14:41.429	313
315	task	25	5	@Kamal yeh plan complete hua kya?	2026-03-12 05:00:46.27	\N
316	task	25	2	@Nizam ye Plan Qamar Hold Karne Bola Hai	2026-03-20 07:00:21.412	\N
317	task	37	5	test	2026-03-07 04:46:44.291	\N
318	task	37	5	OK	2026-03-07 04:46:52.833	317
319	task	37	5	Expenses ki entry ho gayee thi?	2026-03-07 17:25:41.824	\N
320	task	41	5	1 - Task comments slow hai\n2 - Quotation ka PDF download nahi ho raha hai	2026-03-07 06:20:13.126	\N
321	task	41	5	Portal ka sabhi options bahut slow chal rahe hain, aur update bhi aadha adhoora ho raha hai	2026-03-07 08:24:10.235	\N
322	task	43	5	Yeh bank statements se Zoho me cross check karna hai	2026-03-07 17:27:23.206	\N
323	task	43	4	ok	2026-03-09 05:06:43.799	322
324	task	43	5	Kindly update once completed	2026-03-09 05:05:27.757	\N
325	task	43	4	sab matched hai, Bafna ka 2 baar hamne kiya tha payment, ek baar 5000/- aur dosri baar 1000/- uska record payment nhi hua hai.\naur dosa 27 February ko Nayana Jaywant ka payment 1500/- aaya hai uski entry nhi hai zoho mein	2026-03-09 06:14:04.381	\N
326	task	45	3	Task done	2026-03-09 06:21:14.299	\N
327	task	46	5	The company profile can be made in a minimum of 16 pages. After designing, it will be clear whether it will fit in 16 pages or need to be extended to 20–24 pages.\nLump sum design cost: ₹32,000/- (up to 24 pages). If pages exceed 24, the cost will increase accordingly.\nThis design will mainly be prepared for digital use, keeping single-page viewing in mind. Short-quantity digital printing can also be done from the same file. However, if high-quality DPI print output for mass offset printing is required, the design will need to be prepared accordingly. Cost for high-resolution print-quality design: ₹48,000/-.\nDeliverables: Adobe Illustrator open editable file, JPEG, PDF for soft sharing.	2026-03-07 20:19:41.09	\N
328	task	46	5	OK	2026-03-07 20:19:52.047	327
329	task	47	5	Refresh par dashboard aa jaata hai. aisa hona chahiye ki hum jis job ya task ke jis stage par hain refresh hone ke baad me bhi usi stage par rahna chahiye.	2026-03-07 20:28:53.404	\N
330	task	47	6	Okay will check	2026-03-09 21:37:47.288	329
331	task	47	5	Order ya kisi bhi field me text selection ke time overlay par jaa raha hai.	2026-03-07 20:52:55.267	\N
332	task	47	6	Alright	2026-03-09 21:37:51.573	331
333	task	47	5	check kar rahe hain	2026-03-10 08:04:59.118	\N
334	task	49	2	@Nizam GRK ke Office se Phone aaya tha cheque Ready hai - shaikh Shameem ko bola hon Cheque Collect karne	2026-03-10 06:09:11.126	\N
335	task	50	2	@Nizam Arjun Thesia ka Payment aaya Hai 7000/-	2026-03-11 06:51:03.621	\N
336	task	50	2	@Nizam  aur Amount Add kar ke Deposite karna tha	2026-03-11 06:53:30.814	\N
337	task	50	5	aaj ₹ 7,000/- cash deposit kar do bank me	2026-03-12 05:02:47.826	\N
338	task	50	2	@Nizam shaikh Shameem Ko Bol diya Hon deposite karne	2026-03-12 05:35:58.729	\N
339	task	54	5	yeh kaam ka plan kab ka hai?	2026-03-12 05:03:04.905	\N
340	task	54	2	actually Sunboard lagne wala tha Lekin woh Board ke Niche Ladkaye gain tu Loss rahega aur Hawa main Laherega	2026-03-12 05:44:21.114	\N
341	task	54	2	Sunboard ka Cancel kar ke MS Frame karte Hai	2026-03-12 05:45:15.96	\N
342	task	55	5	baat kiye kisi aur shtter wale se?	2026-03-12 05:03:21.13	\N
343	task	55	2	nahi, Aaj karta hon	2026-03-12 05:37:15.925	\N
344	task	55	2	@Nizam Jinam Xerox se Color Print NIkalne Jane Wala hon tab Shutter Wale ka Dekhta hon	2026-03-14 05:00:24.064	\N
345	task	55	2	81081 61864 Sandeep shutter sec 12, Kharghar is se baat hwui hai ye Monday ko aakar check karega	2026-03-14 11:45:29.033	\N
346	task	55	2	Shutter ko Call kiya tha Aane Wala Hai	2026-03-16 05:57:01.147	\N
347	task	55	2	@Nizam ye shutter wala aaj bola tha aane aur call bhi Kiya tha mein lekin aaya nahi	2026-03-16 12:35:29.878	\N
348	task	55	2	@Nizam ye shutter wala response nahi de rah hain abhi Dusre Shutter wale se baat kiya Hon - woh aaj aayega ya tu Kal aayega	2026-03-17 05:21:04.104	\N
349	task	56	5	is me jo screen shot hai woh sab bills ki entry hai Zoho me, check kar ke confirm kijiye.	2026-03-09 05:53:18.612	\N
350	task	56	4	2 Bills entry nhi hai \n4541/25-26\n4866/25-26	2026-03-09 06:10:06.406	\N
351	task	56	4	only 4866/25-26 ye bill pending hai	2026-03-09 06:53:34.113	\N
352	task	57	4	Actually ye bill jo uploaded hai, exactly wahi bill hai, par sona ka bill jo aata hai wo 3 page ka aata hai isliye aap ko lag raha ki match nhi ho raha hai.	2026-03-10 03:24:24.866	\N
353	task	61	5	Dear Sir, your domain and email service for www.dpconstructions.co.in are going to expire on 13 March 2026. The renewal amount is ₹10,790/-.\nKindly make the payment to the bank details below and share the payment acknowledgment so that we can proceed with the renewal.\n\nBank Details: MOMINS TRADING PRIVATE LIMITED\nCURRENT A/C NO. : 50 2000 5914 5538 \nBANK: HDFC BANK \nBRANCH : SEC-7, KHARGHAR \nRTGS / NEFT IFSC: HDFC 000 1102	2026-03-09 08:08:18.637	\N
354	task	61	5	in sabhi ko whatspp bheja hoon\nDP Infra Office +91 86521 68971\nSnehal +91 99705 22092\nKalyani +91 91 3797 691 6	2026-03-09 08:10:19.978	\N
355	task	62	5	Dear Sir, \nyour domain and hosting service for MANGOBASKETKONKAN.COM are going to expire on 17 March 2026. The renewal amount is ₹5,200/-.\nKindly make the payment to the bank details below and share the payment acknowledgment so that we can proceed with the renewal.\n\nBank Details: MOMINS TRADING PRIVATE LIMITED\nCURRENT A/C NO. : 50 2000 5914 5538 \nBANK: HDFC BANK \nBRANCH : SEC-7, KHARGHAR \nRTGS / NEFT IFSC: HDFC 000 1102\n-----\nupar ka message 9 March 26 ko send kiya tha, phir 16 March 2026 ko kiya	2026-03-20 18:20:30.4	\N
356	task	62	5	Your domain mangobasketkonkan.com has expired last night, and the website is now down.\n\nThis is the final reminder related to this domain.\n\nTo avoid permanent loss of the domain and data, please proceed with the renewal at the earliest.\n\nOnce the payment is done, share the acknowledgment so we can renew it immediately.\n-----\nyeh message 19 March 2026 ko kiya	2026-03-20 18:21:00.453	\N
357	task	63	1	@Nizam Al-Ifrah wale 11.03.26 ko payment karne wale they lekin abhi tak kiye nahi hai.. aaj nizam bhai ko message kiya hun reminder keliye.	2026-03-12 08:42:53.428	\N
358	task	63	1	@Nizam unka reply aaya hai.. bole hain ke aaj karwa denge.	2026-03-12 09:21:43.76	357
359	task	63	1	@Nizam HD Builders & Developers - Tayib Hamdule sir phone receive nahi kiye, unko whatsapp message kiya hun.	2026-03-12 08:44:04.069	\N
360	task	63	1	@Nizam Tayib Hamdule sir ko phone kiya tha, aaj wo gaon ki taraf gaye hain shayed raat me hi return honge ya kal aayenge, uske baad wo check karke batayenge status.	2026-03-30 11:51:56.677	359
361	task	63	1	@Nizam Asil Infracon - Naeem Bhai ko call kiya lekin wo phone nahi uthaye, amount aur QR Code whatsapp kiya hun unko.	2026-03-12 08:47:55.97	\N
362	task	63	1	@Nizam Asil Infracon ka payment aa gaya hai	2026-03-13 09:50:19.916	361
363	task	63	1	@Nizam Dr. Vishal Chafale sir ko call kiya tha wo saamne se bole accha aapka kuch payment baki tha wo karta hun. main unko proforma wapas se whatsapp kiya hun.	2026-03-12 08:52:56.457	\N
364	task	63	1	@Nizam Dr. Vishal sir ka payment aa gaya hai.	2026-03-13 09:50:39.916	363
365	task	63	1	@Nizam Morajkar Estates LLP - Yashodham - Geetanjali madam ko dono number se call kiya but unhone phone pickup nahi kiya. message kiya hun unko whatsapp par.	2026-03-12 09:00:51.356	\N
366	task	63	1	@Nizam Madam bole hain ki sir out of mumbai hain, teen chaar din baad aane wale hain to payment karwati hun.	2026-03-18 05:45:21.917	365
367	task	63	1	@Nizam Civitas - SKA Hiring - Swapnil sir ko Reminder message kiya hun, kal inko call karunge.	2026-03-12 09:18:42.108	\N
368	task	63	1	@Nizam Sadguru Associates - Pravin Patel ko phone kiya but phone receive nahi kiye.. whatsapp par message kiya hun.	2026-03-12 09:47:36.433	\N
369	task	63	1	@Nizam Sanjay Patel ka reply aaya hai, OK KARWA DETA HUN.	2026-03-12 10:08:10.991	368
370	task	63	1	@Nizam Sadguru associates ke accountant ka phone aaya tha, Monday karne wale hain payment.	2026-03-13 09:51:06.661	368
371	task	63	5	OK	2026-03-12 13:54:08.507	\N
372	task	63	1	@Nizam Payment Followup ka aap update kar denge to mujhe bata dijiye.	2026-03-23 07:30:03.785	\N
373	task	63	1	@Nizam Morajkar me cheque ready hai, aaj shaam 5:30 pm ko collect karne bole hain.	2026-03-30 10:01:25.276	\N
374	task	63	1	@Nizam Nirmaan Aishwaryam - Ashish Padwal Pune, aaj inko payment reminder message kiya hun.	2026-04-01 06:29:34.676	\N
375	task	69	5	is baare me baat hui CA se?	2026-03-12 05:00:03.766	\N
376	task	69	2	@Nizam Do Din Phele Call kiya tha Woh Available nahi the	2026-03-12 05:31:14.537	\N
377	task	69	2	@Nizam Aaj Call karke Meeting karta Hon	2026-03-12 05:31:39.402	\N
378	task	69	2	2 din Baad Follow up karna Hai	2026-03-17 10:42:14.738	\N
379	task	70	5	GST Certificate	2026-03-09 12:57:43.243	\N
380	task	70	5	Original Price: ₹52,995.76 \nDiscount: − ₹3,000.00 \nTaxable Amount: ₹49,995.76 \nGST 18%: ₹8,999.24\nGrand Total: ₹58,995	2026-03-09 12:58:22.917	\N
381	task	72	1	@Nizam aaj 10.03.26 ko call kiya tha unhone phone uthaya nahi hai. message karta hun unko.	2026-03-10 10:18:10.836	\N
382	task	72	1	@Nizam Aaj dinesh sir ko reply aaya hai, *please wait* karke.	2026-03-11 07:21:39.322	\N
383	task	72	1	@Nizam Aaj dinesh kasat sir ko email kiya hun company profile design.	2026-03-12 06:00:18.671	\N
384	task	73	5	is me jo payments aaye hain woh cross check kar ke um ke Tax Invoices generate karna hai aur payment bhi update karna hai	2026-03-10 16:31:31.268	\N
385	task	74	5	Printing me bhejna hai	2026-03-20 18:21:44.58	\N
386	task	75	2	Floor Plan Main Cloum Remove karna Hai aur Car Parking mein Number Likhna Hai,	2026-03-11 06:11:59.648	\N
387	task	75	2	@Nizam Plan Uploaded Hai One Drive Mein	2026-03-11 06:13:26.56	\N
388	task	75	2	@Nizam Plan Par Working Chalu hai	2026-03-11 06:54:33.71	\N
389	task	75	5	yeh floor plan complete hua?	2026-03-12 05:03:43.813	\N
390	task	75	2	@Nizam Plan Par Working kar rah Hai ek se Dedh Ghanta lagega	2026-03-13 07:24:19.639	\N
391	task	75	2	@Nizam abu Faiz ne Ju Correction bataya tha Car Number & Cloum Remove Woh Sabhi kar diya Hon	2026-03-13 11:01:11.649	\N
392	task	75	2	@Nizam Abu Faiz Ne Plan Main Aur Correction Bata ya hai Car Parking ka Numbering ka us main Thoda Time Lagega	2026-03-14 05:57:54.013	\N
393	task	75	2	@Nizam color print nikal kar Booklet bana deta hon	2026-03-19 04:28:05.762	\N
394	task	75	2	@Nizam aaj Color Print Out Nikalta hon	2026-03-20 07:05:48.64	\N
395	task	76	2	shelter ka Images Jitna Asani se Mila hai woh Wapas se Mail kar rah hon	2026-03-11 10:02:31.607	\N
396	task	79	2	@Nizam Letter Head Design par work kar rah hon	2026-03-12 05:11:12.81	\N
397	task	79	5	ok	2026-03-12 05:15:00.108	396
398	task	79	2	Letter Head Proofing main Bheja Hon	2026-03-12 10:49:05.263	\N
399	task	80	2	shaikh shameem ne aaj cheque Deposite kar diya Hai 10:00 baje se Phele	2026-03-12 05:16:27.362	\N
400	task	82	2	shameem Bhai ko 7000 dediya hon HDFC Bank mein Deposite karne ke liye	2026-03-12 05:30:03.625	\N
401	task	83	2	Santosh se Call kar ke Status Leta Hon	2026-03-12 05:40:34.289	\N
402	task	83	2	@Nizam Paper Bag Ready hai Byuclla Main - Direct Taloja Main Delivery kar rah hon	2026-03-14 05:50:37.037	\N
403	task	83	2	@Nizam paper bag delivery hogaya hai ,  Proforma invoice bhi delivery howa hai	2026-03-14 11:59:07.923	\N
404	task	84	2	@Nizam Selection main Mail kiya hon Bill ke liye - Bill No 17753\nBill No 18520\nBill No 18552	2026-03-12 06:10:41.552	\N
405	task	84	2	@Nizam Selection wale Bill Mail kiye Hai - Shameem Bhai ko Inform kar diya Hon	2026-03-12 06:15:02.271	\N
406	task	85	2	@Nizam Date         Company Name          \n11-12-24   Momins Trading Pvt Ltd   44664\n17-12-24   Momins Trading Pvt Ltd   44736\n04-01-24   Momins Trading Pvt Ltd   44926\n13-01-25   Momins Trading Pvt Ltd   45007\n11-03-25   Momins Trading Pvt Ltd   45660\n17-03-25   Momins Trading Pvt Ltd   45698\n22-03-25   Momins Trading Pvt Ltd   45771	2026-03-12 05:57:33.949	\N
407	task	85	2	@Nizam Bafna main Mail kiya hon Bill bhejne ke liye	2026-03-12 05:58:12.888	\N
408	task	92	5	20260221-158 is me Proofing naam se folder hai, us ka printout nikalna hai same size me. 9"x13" ka page hai. aur jo floor plan aap ne kiye ho us ka bhi print nikalna hai. floor plan ka print 26"x8" matlab 26" width rahegi aur height 8" rahegi, us size me bitha kar same size ka us ka bhi print nikalna hai. aur jab print ready ho jaayega cutting pasting kar ke to Abu Faiz ko phone kar ke us ko bulana rahega office par aur us ko samjhana rahega kaise banega yeh brochure.	2026-03-12 14:00:05.16	\N
409	task	92	2	@Nizam OK	2026-03-13 05:16:35.163	\N
410	task	92	2	@Nizam abri crystal brochure dummy ready hai , Floor plan Cutting karna hai Monday konkarta hon	2026-03-14 12:19:59.64	\N
411	task	92	2	@Nizam Abu Faiz ko Bola Hon Dummy Ready Hai, Office par aane Bola hon	2026-03-16 06:07:15.975	\N
412	task	92	2	@Nizam abu faiz aaya tha, Floor plan ka Booklet type karna hai, Horizontal size main	2026-03-16 12:41:44.152	\N
413	task	92	2	@Nizam Brochure dummy main last page par contact Number wrong hai	2026-03-16 12:42:33.108	\N
414	task	93	5	@Kamal Balaji Heights ke plan ke liye Mr. Shubhash Bhutia ko phone kar lo, agar OK hai to print me bhejna hai.	2026-03-20 18:16:53.037	\N
415	task	93	2	@Nizam Subhash Bhutia ko Call kiya Floor Plan ke Approval ke liye woh bole main check kar ke Batat Hon	2026-03-23 11:43:50.88	\N
416	task	93	2	@Nizam call kiya Phone Not reachable	2026-03-24 05:45:29.746	\N
417	task	93	2	@Nizam Subhash ko Call kiya tha woh bahar hai, abhi check nahi kar payegain, kal ya parson check karegain Floor Plan	2026-03-24 10:12:46.689	\N
418	task	93	2	@Nizam mail main Correction aaya hai, open file kis ke pass hai malum nahi?	2026-03-30 04:07:50.083	\N
419	task	96	1	@Nizam yeh printing keliye ready kar raha hun, with quality check.	2026-03-13 09:33:59.046	\N
420	task	97	2	Vasant Leela\nFlex\nQty: 1\nSize: 15x8 Feet\nGardenia Flex\nQty: 2\nSize: 20x10 Feet	2026-03-13 11:07:12.081	\N
421	task	97	2	@Nizam Flex Office Par Rakha Hai Sheetal Madam Kal Collect Karegi Morning mein	2026-03-13 11:09:08.185	\N
422	task	98	2	@Nizam ye Floor plan Eid se phele karna hai	2026-03-13 11:42:39.41	\N
423	task	98	2	@Nizam Ye Plan Nahi Karna Hai Qamar ne Bola Hai	2026-03-20 07:04:38.012	\N
424	task	98	2	@Nizam aaj is par working karne Wala Hon	2026-03-27 05:28:31.034	\N
425	task	98	2	@Nizam Working chalu hai Saturday ko plan clean kane time laga tha file mai error bhi tha, aaj is par working karrah hon	2026-03-30 04:11:15.659	\N
426	task	98	2	@Nizam Sky Elite Floor Plan Hirani Sir Ko Bheja Hon Woh check karke batane Wale Hai Correction	2026-04-01 05:38:52.475	\N
427	task	98	2	@Nizam cmeri Traf se plan kar diya hon Clients ki traf se Correction baki hai	2026-04-03 05:27:52.995	\N
428	task	100	2	@Nizam Job Selection main Bheja hon - Aur Special Instructions: Top Pad Binding : 100x 10 pads ka Bhi lIkh diya hon	2026-03-14 06:52:38.085	\N
429	task	101	2	@Nizam Paper Calculation & Prestige Wale Se Baat Karna Hai Thermal Lamintion ka Aur Paper Art Kitna GSM Lena Hai Confrim Karna Hai	2026-03-14 05:54:51.853	\N
430	task	101	2	@Nizam Paper Delivery Saturday Ko Hogaya tha Printing Monday Se aaj Start karne wale Hai	2026-03-16 06:08:46.783	\N
431	task	102	1	@Nizam Abhi is par working kar raha hun.	2026-03-14 09:01:23.656	\N
432	task	102	1	@Nizam yeh correction karke abhi share kiya hun client ko.	2026-03-16 07:01:45.708	\N
433	task	104	2	@Nizam Supermax Letter Head File Find, Check Sent to Client For Proofing	2026-03-16 05:58:45.623	\N
434	task	104	2	@Nizam Letter Head Mail kiya hon Proofing main hai	2026-03-16 07:03:24.415	\N
435	task	104	2	@Nizam Letter head Final hai kal Printing main bhejta hon	2026-03-16 12:36:22.071	\N
436	task	104	5	@Kamal confirmation ka email aaya hai, printing me bhej do	2026-03-17 03:07:44.739	\N
437	task	104	2	@Nizam ok	2026-03-17 04:08:20.784	\N
438	task	104	2	@Nizam Job Print main Bhej diya Hon - 23-03-26 ko Milega	2026-03-17 06:08:25.656	\N
439	task	105	2	@Nizam Correction & Proofing	2026-03-16 06:00:26.223	\N
440	task	105	2	@Nizam Letter head main madam ne correction batya tha , correction kar ke whatsapp kiya hon	2026-03-16 12:39:00.668	\N
441	task	105	2	@Nizam Correction kar ke Proofing main Bheja hon	2026-03-17 09:25:06.71	\N
442	task	105	2	@Nizam printing main bhejna hai Quotation final hone ke baad	2026-03-18 04:44:22.038	\N
443	task	105	2	@Nizam Reshma Madam ko Call kiya tha, Job Confirm keliye - woh Quotation check kar ke Batane Wale Hai	2026-03-18 08:12:45.807	\N
444	task	105	2	@Nizam aaj Follow up liya tha Reshma Madam Nahi the, Sagar Ne Phone Receive kiya tha Woh Bole mein Quotation check kar ke Btata Hon	2026-03-19 10:03:39.204	\N
445	task	105	2	@Nizam Printing mai Gaya Hai	2026-03-23 11:44:47.216	\N
446	task	106	2	@Nizam Balaji Ka Color Print nikalna Hai aur Subhash sir ko Bhej kar Proofing & Approval Lena Hai	2026-03-16 07:05:54.583	\N
447	task	107	1	@Nizam yeh correction karke client ko with watermark and encrypted pdf share kar diya hun.	2026-03-16 09:26:45.143	\N
448	task	109	5	bank statement me aur Zoho me cross check karna hai, jo bhi entry missing hai woh karna hai.	2026-03-17 04:15:35.016	\N
449	task	110	2	@Nizam job Mail kiye hain santosh ko call karke batana hai	2026-03-17 04:43:30.907	\N
450	task	110	2	@Nizam santosh ko whatsapp par massage Kiya hon woh ok bola hai job check karlega	2026-03-17 05:11:12.353	\N
451	task	110	2	@Nizam Brochure Binding how hai only Pocket Pasting Baki 2 Days aur Lagega	2026-03-23 11:46:51.552	\N
452	task	110	2	@Nizam Job Ready hai - Direct Delivery karne Wala Hon	2026-03-26 07:58:07.657	\N
453	task	110	2	@Nizam Subhash Sir se Pooch kar Job Delivery karna Hai un ka Do Office Hai ek Factory Kalamboli main aur dusra CBD Belapur Main	2026-03-27 05:24:39.74	\N
454	task	111	2	@Nizam sona paper inform karn hai PO mail kiye hai paper kab Delivery hoga	2026-03-17 04:49:53.511	\N
455	task	111	2	@Nizam sona main madam se confirm howa hai paper aaj delivery hojayega	2026-03-17 04:57:25.988	\N
456	task	111	2	@Nizam 1 pm tak ho jayge lower parel se nikla hai - Sona Paper	2026-03-17 08:04:21.496	\N
457	task	114	1	@Nizam Logo ka ek aur option banakar client ko share kiya hun, client abhi Mumbai me nahi hai, agle hafte aayega to office par aayega.	2026-03-20 06:27:45.552	\N
458	task	117	1	@Nizam yeh flex design karke Majid Patel sir ko share kiya hun.	2026-03-18 11:15:13.796	\N
459	task	118	2	@Nizam 20260317-182 -Shreeji Developer Sale Display - Z Plus - New Elevation ka photo add karna Hai aur Kruti Madam ko bhejna rahega Proofing main	2026-03-17 06:07:02.225	\N
460	task	118	2	@Nizam Shreeji Z Plus Sale Display ka Design bheja Hon, Sale Displa Main Floor Plan Mein Changes batane Wale Hon	2026-04-02 10:11:38.494	\N
461	task	119	2	@Nizam abu Faiz Ne Letter Head ka Oder diya Hai Qty - 500	2026-03-17 08:05:29.903	\N
462	task	119	2	@Nizam Selection main Printing main Bhej Diya hon	2026-03-17 08:06:04.259	\N
463	task	120	2	@Nizam Bajaj School Hand book old record check paper Quality cover page & inners pages & printing rate	2026-03-18 04:48:58.805	\N
464	task	120	2	Size 1/8\nBajaj International School\nBooklet\nSize: 135x210 mm\nPages : 32 and Common pages to be continued.\nCover Paper : 320 gsm White Back Duplex \nInner Paper: 70 gsm Ballarpur Maplitho \nLamination: Gloss Lamination on Cover Only\nQty: 1000\nRemark : Complete Book Binding	2026-03-18 07:03:51.109	\N
465	task	120	2	@Nizam 👆first comment main complete details hai Bajaj school handbook size 1/8 qty 1000	2026-03-18 07:05:13.711	\N
466	task	120	2	@Nizam Mahesh Se Rate Nikal ta hon Paper ka	2026-03-18 07:34:36.196	\N
467	task	120	2	@Nizam Quotation vendor ka price nikla hon mahesh paper & rajesh ka woh app ko bhejta hon	2026-03-19 04:26:02.487	\N
468	task	120	2	@Nizam deepika madam kal call ki thi aaj unko bola hon quotation dene	2026-03-19 04:26:47.256	\N
469	task	120	2	Quotation Hand Book\nSunrise Global School - Hand Book Quotation\n1 - Vendor Rajesh Printouch\nSize 1/8\nBooklet\nSize: 135x210 mm\nPages : 32 and Common pages to be continued.\nCover Paper : 320 gsm White Back Duplex \nInner Paper: 70 gsm Ballarpur Maplitho \nLamination: Gloss Lamination on Cover Only\nQty: 1000\nRemark : Complete Book Binding\nTotal Amount - 18200/- GST\n2 - Mahesh Paper\n1 - Ballarpur maplitho - Inner Paper 70 gsm\nPaper size : 23x36\nQty : 5500 \nper Ream Rate  1415/- X 11 Ream = 15,565/- 18% GST 18366/- Transport 1000/- 19366\n2 - white back duplex / 320 gsm\nPaper size : 25x36\nQty : 150 ( Sheet 200 ) \n1060 per pkt of 100 sheets Amount - 1060x2 = 2120/- plus delivery and plus gst \n3 - Transport Charg Extra on Site Delivery as Actual\n4 - Cover Design 2 Pages 2000/-\n5 - Inner Pages DTP Charge Total 33 Papges X 100/- Designing 3300/-\nTotal Amount - 18200+19366+5300= 37265/-\n42,866/- + Profit 30% 12,859.8= Final Amount - 55,725	2026-03-19 08:22:10.737	\N
470	task	120	2	@Nizam deepika madam call ki thi un ko school ki Book urgent hai, woh bol rahi hai, cover Design bana kar bhejo, aur quotation bhi bhejo bol rahi hai	2026-03-30 04:23:07.349	\N
471	task	120	2	@Nizam Hand Book mein Design ka Kitna Pages hai, Madam se Baat kiya tha Madam Bole Bajaj School ki Book Ka PDF Bhejo us main check kar ke Btane Wale Hai	2026-04-01 05:47:27.261	\N
472	task	122	2	@Nizam Plastic Folder previous folder se thoda soft chahiye reshma Madam ko	2026-03-18 04:28:56.82	\N
473	task	122	2	@Nizam shivam Plastic se Quotation nikalta hon	2026-03-18 04:33:50.907	\N
474	task	122	2	@Nizam Plastic Folder Quality "F Type" mangwaya Hon - Sample Shelter ki Office main Bhjena Hai	2026-03-23 11:48:46.212	\N
475	task	122	2	@Nizam Folder sample  Nerul office main diya hon kal final karke batey gain	2026-03-23 15:03:09.05	\N
476	task	122	2	@Nizam Shivam Plastic - quality Type *F* rate 6/- +18 gst	2026-03-24 14:20:37.659	\N
477	task	122	2	@Nizamas its print karan hai Plastic Folder Phele Wala Hi Lena Hain Qty 500 Reshma Madam Se Confrim kiya Hon	2026-03-26 08:46:43.863	\N
478	task	122	2	@Nizam Reshma Madam se follow up lena hai , plastic Folder ka	2026-03-30 04:31:29.581	\N
479	task	122	2	@Nizam Tuseday ko Call kiya tha Madam Bole Zaid Sir se Approval liye nahi hai - Aproval lene ke baad Oder Confirm hoga	2026-04-01 05:31:24.042	\N
480	task	123	1	@Nizam inko logo ke payment keliye message kiya hun, but kuch reply nahi aaya hai. EID baad call karenge to accha rahega.	2026-03-19 11:17:55.108	\N
481	task	125	2	@Nizam ye Job kal print main bhejta honLetter Heads - 500\nEnvelope - 500\nReceipt Book - 500 pages\nVisiting card - 1000	2026-03-18 11:35:16.642	\N
482	task	125	2	@Nizam Letter Heads - 500\nEnvelope - 500\nReceipt Book - 500 pages\nVisiting card - 1000 ye Sab hi Jobs Printing main Gaya Hai - Receipt Ready hone ke Fort Collect karne Bol donga Babu seth Binder ko	2026-03-20 07:02:52.554	\N
483	task	126	2	@Nizam vashi selection main three job ready hai mangwana hai	2026-03-19 04:07:19.744	\N
484	task	126	2	@Nizam 1) Crescent Clinic Letter head 2) Supermax boiler Letterd 3) abri realty Letter head	2026-03-19 04:07:47.329	\N
485	task	128	3	@Nizam Packing kar rahei Hon	2026-03-19 10:22:15.97	\N
486	task	132	5	job create hone ke baad is ka namaha construction ka proforma banana hai	2026-03-23 05:30:47.289	\N
487	task	132	5	Namaha Construction	2026-03-23 06:55:24.149	\N
488	task	133	3	Aqva vista buildcon llp ka job create karna hai data chaiye	2026-03-23 07:16:29.587	\N
489	task	133	3	@Nizam	2026-03-23 07:17:38.765	\N
490	task	135	5	email sent, Message to send Shashi Roy\n---\nDear Sir,\n\nThis is to inform you that your domain and hosting is going to expire soon. The details are as follows:\n\nDomain Name: www.satyambuilders.co\nExpiry Date: 23rd March 2026\nRenewal Amount: ₹10,124/- Including GST (1 Year)\n\nKindly make the payment using the bank details below and share the payment acknowledgment so that we can proceed with the domain renewal.\n\nBank Details: MOMINS TRADING PRIVATE LIMITED\nCURRENT A/C NO. : 50 2000 5914 5538\nBANK: HDFC BANK\nBRANCH : SEC-7, KHARGHAR\nRTGS / NEFT IFSC: HDFC 000 1102	2026-03-20 19:07:52.753	\N
491	task	138	5	- home page photo change karna hai.\n- ek button ka error hai\n- Images ka suggestion lena Shemoil se\n- SEO ke baare poochna hai Cluade se.	2026-03-20 19:40:56.917	\N
492	task	138	5	https://dd.nyc/ - yeh website mujhe acchi lagi.	2026-03-21 06:10:42.345	\N
493	task	139	2	@Nizam Ok Check karta hon	2026-03-23 05:28:06.024	\N
494	task	139	2	@Nizam tabark bhai ko call kiya tha, woh bole app khud kar sakt hon, camera ka connection thode time bandh rakhna hai, aur camera ke point connection ko ek par joint karna hai, hogaya tu theek hai, nahi tu woh tecnician ko bheje gain	2026-03-30 04:16:14.509	\N
495	task	141	2	@Nizam Babu seth ko Bola Hon Job Collect karne aur Binding karne bola Hon	2026-03-23 07:48:41.816	\N
496	task	141	2	@Nizam Receipt Ready Hai - aaj Aane Wali Hai	2026-03-26 07:59:17.762	\N
497	task	141	2	@Nizam Aaj 2nd Half Main Aane wali Hai	2026-03-27 05:22:42.768	\N
498	task	141	2	@Nizam Aaj 2nd Half Main Aane wali Hai	2026-03-27 05:30:35.913	\N
499	task	143	2	@Nizam Delivery Done via Porter	2026-03-23 15:00:08.251	\N
500	task	144	2	@Nizam Maroof se Baat hwui thi woh andhrei site par kaam chalu hai ek, 2 din baad Visit kar sakta Hai Site par lekin fix time nahi hai aage phiche bhi hosakta Hai	2026-03-24 10:41:55.215	\N
501	task	144	2	@Nizam Aaj Builder ki Office par Visit Kiye the aur Size Lekar aaye hai Quotation Nikalna Rahega	2026-03-25 12:47:23.666	\N
502	task	144	2	Size	2026-03-25 12:47:40.265	\N
503	task	144	2	@Nizam Comapny Logo Name & Services Text Matter Setting in sizes	2026-03-26 11:44:00.382	\N
504	task	144	2	@Nizam is par Working kar rah hai	2026-03-27 05:31:46.578	\N
505	task	144	2	@Nizam Quotation Ready hai Bhej rah hon	2026-03-28 11:49:34.661	\N
506	task	144	2	@Nizam quotation forward Kiya hon Saturday ko	2026-03-30 04:25:46.077	\N
507	task	144	2	@Nizam Quotation Final Howa Hai, Sachin Kadam ne Phone kiya Tha, un ke Boos se baat karna Hai office jakar - 3:00 baje Jane Wala Hon	2026-03-30 06:54:25.269	\N
508	task	144	2	@Nizam Sachi Kadam Se Baat Hwui thi Wednesday ko Meeting rakhne ki - Maroof ko Bhi Bola Hon	2026-03-31 06:09:57.385	\N
509	task	144	2	@Nizam Tuseday ko Wasif Parkar - Innovative Wala Call kiya Tha Woh Bole Raha ju Bhi Kaam hai woh Mera Samajh kar karo	2026-03-31 06:11:43.367	\N
510	task	144	2	@Nizam Glass ka Cancel lkiye Hai Glass Ki Jagah Acrylic Use kar na Hai Quotation Wapas se Nikalna Hai	2026-04-02 10:13:12.755	\N
511	task	145	2	@Nizam Ye Display Shelter Builders ka Job ke Saath Aayega	2026-04-01 05:41:49.588	\N
512	task	147	1	@Nizam Yeh correction karke client ko share kiya hun.	2026-03-25 12:30:08.353	\N
513	task	149	5	Payment done today	2026-04-02 17:11:35.274	\N
514	task	153	2	@Nizam Shelter Builder Envelopes & Letter Head Delivery via Porter with Invoice	2026-03-26 05:33:16.956	\N
515	task	153	2	@Nizam Job Delivery Done	2026-03-26 07:57:06.242	\N
516	task	155	2	@Nizam Staff ki Salary Kon se Mahine main Kitni Gayee Hai Details Chahye - April, March Mahine KI	2026-03-27 09:08:18.61	\N
517	task	160	5	CA se samajh kar lena hai us ko kya chahiye sirf itna chahiye ki per month salary kitni hai ya pichle accounting year ki puri puri salary chahiye sab ki	2026-03-28 03:10:31.107	\N
518	task	163	5	https://1drv.ms/b/c/76a84e29c858ad5a/IQCP6hh6t3eGRLPJmtYfQ_O5AcrsfW6PuJSSk968KrPM6tM?e=ncnUen	2026-03-29 08:30:17.307	\N
519	task	163	5	yeh floor plan ka printout nikal kar check karna hai, aap check karne ke baad OK bologe to print me bhejoonga	2026-03-29 08:30:49.656	\N
520	task	163	1	@Nizam Print Nikal kar check kiya hun, page sequence wagerah sab perfect hai.	2026-03-30 05:39:22.389	\N
521	task	169	2	@Nizam ye Job collect karte howe office Aarah hon	2026-03-30 04:45:55.451	\N
522	task	169	2	@Nizam Job Delivery ka Accounted se Confirm kar ke karta hon with Proforma	2026-03-30 06:13:52.11	\N
523	task	169	2	@Nizam Ajay Deep main Piysh Patel ke Ghar par Delivery hogayee hai - Vijay Watchmen ne Collect kiya Hai Job	2026-03-31 06:02:34.712	\N
524	task	178	2	@Nizam The Prop Kingdom - 1)  Acrylic Sign Board - 3D Acrylic Letter higher Depth & ACP Board Size 9x3 Feet or 10x3 2) Glow Sign Board ( Light Box) Solid Vinyl Cutting Pasting ob Backlite Media = 9x3 Feet or 10x3	2026-03-31 06:04:52.706	\N
525	task	178	2	3) Eco Print matt Lamintion+Sunbaord 5mm size : 24 x130 inch Installation - Screw or Pasting	2026-03-31 06:08:58.617	\N
526	task	186	2	@Nizam Prestige main Call karke Bola Hon jOb mail kiya Hai aur Paper 1st Half Main Delivery hojayega	2026-04-01 07:00:33.496	\N
527	task	186	2	@Nizam Brochure Dummy Ready hai Kal Pickup karwata Hon	2026-04-01 13:25:43.368	\N
528	task	186	2	@Nizam Dummy Office par Ready hai	2026-04-02 10:09:14.245	\N
529	task	187	2	@Nizam Floor Plan Par Working karna Hai	2026-04-01 13:24:36.225	\N
530	lead	3	1	@Nizam Aaj yeh client ko quotation share kiye hain whatsapp par.	2026-03-12 05:20:29.113	\N
531	lead	5	1	@Nizam aaj client update pooch raha tha to maine client ko whatsapp par yeh message kiya hai   "Sorry for late update : sir actually person available nahi hai office visit keliye, Aap mujhe aapki office ka front side ka photo share kijiye jahan main board lagne wala hai, Main aapko quotation share kar deta hun.	2026-03-12 06:02:55.113	\N
532	lead	6	1	@Nizam inka advance aane ke baad company profile design karna rahega, Already unki company profile ka design kahin se bana huwa hai, us ko re-design karna hai, Yeh client DP construction wale ke wahan kaam kar chuka hai as contractor partner I think,	2026-03-11 04:58:16.271	\N
533	lead	6	5	OK	2026-03-11 06:25:53.157	532
534	lead	6	5	@Shahjahan yeh job create kar do	2026-03-11 06:26:55.332	\N
535	lead	6	3	ok	2026-03-11 07:07:19.296	534
536	lead	7	1	@Nizam yeh sai mannat wale client hain, inko ek naye project ka brochure banana hai. Project name : Sai Majestic hai, abhi 3D wagerh aaya nahi hai, final sabhi content share karne wale hain.	2026-03-12 05:19:21.559	\N
537	order	122	5	Check	2026-04-05 17:37:29.781645	298
538	order	125	6	test 1	2026-04-06 15:54:20.835129	\N
539	order	125	6	test coment 2	2026-04-06 15:54:25.405801	\N
540	order	128	5	@Shemoil	2026-04-10 10:50:12.574361	\N
541	quotation	33	5	@Shemoil	2026-04-10 10:52:27.274841	\N
542	task	175	6	123	2026-04-10 18:28:37.612299	\N
543	task	175	6	4567	2026-04-10 18:28:41.120352	\N
544	task	175	6	\n[attachment:1775831335203-q_1775133660641 (1).pdf|q_1775133660641 (1).pdf]	2026-04-10 18:28:57.331637	\N
\.


--
-- Data for Name: lead_quotations; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.lead_quotations (id, lead_id, quotation_id) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.leads (id, lead_id, date, client_id, client_manual_name, client_manual_contact, job_type, quantity, specifications, delivery_expected, entered_by, status, order_id, converted_client_id, is_deleted, created_at, is_archived) FROM stdin;
1	lead_1773095226467	2026-04-04	\N	Momin Shemoil	+971564123792	Design Services	\N	\N	\N	6	won	\N	\N	f	2026-03-09 22:27:06.467	f
2	lead_1773137144863	2026-04-04	\N	Shaym Ganesh	7506998327	Brochure 12 Pages	\N	We have shared quotations with the client for 12 pages and 16 pages, and we have also shared PDFs of some of our previous brochure samples. This enquiry came on 8655001178.	\N	1	open	\N	\N	f	2026-03-10 10:05:44.863	f
3	lead_1773137417429	2026-04-04	\N	Aryan Pawar	+91 98193 30667	Brochure 	\N	We have just shared the list of required details for the real estate brochure.	\N	1	open	\N	\N	f	2026-03-10 10:10:17.429	f
4	lead_1773137644474	2026-04-04	\N	Ram Bhagyawant	+91 93212 48697	Brochure Plot Layout (Neral - Karjat)	\N	We have just shared the list of required details for the real estate brochure.	\N	1	open	\N	\N	f	2026-03-10 10:14:04.474	f
5	lead_1773143242154	2026-04-04	\N	Sachin Kadam	9867945150	Office Main Board - Real Estate Builders 	\N	The client said that you will need to visit our Turbhe office for board sizing and related measurements. I have asked the client to share their address and company name, so that I can discuss it with my senior.	\N	1	open	\N	\N	f	2026-03-10 11:47:22.154	f
6	lead_1773204966011	2026-04-04	261	Kaustubh Patil	+91 88503 75254	Company Profile 8 or 12 Pages	\N	Skyline Contractors\nRe-Designing Rate (Soft Copy only) \n\nPages: 8       Rs.: 14,000/- + GST\nPages: 12     Rs.: 24,000/- + GST\n\nDesign Schedule : Requirted 4 to 5 working days.	\N	1	won	128	\N	f	2026-03-11 04:56:06.011	f
7	lead_1773292659597	2026-04-04	\N	Deepak Karande	+91 9702577247	Brochure Design & Print - Sai Majestic (Sai Mannat Client)	\N	\N	\N	1	open	127	281	t	2026-03-12 05:17:39.597	f
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.notifications (id, user_id, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: order_assignees; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.order_assignees (id, order_id, user_id) FROM stdin;
2	124	2
3	124	4
4	124	5
16	128	6
17	128	5
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.orders (id, job_id, date, client_id, job_type, quantity, specifications, delivery_expected, quotation_ref_id, quotation_manual_no, quotation_manual_amount, advance, balance, prepared_by, status, is_archived, is_deleted, created_at, project_name, proforma_invoice_number, invoice_number, job_link, notes) FROM stdin;
3	20260126-113	2025-11-22	232	Brochure	300	Pages: 8 \nJob Size: 9"x13"\nPaper: Art Paper\nGSM: 350\nLamination: All pages laminated 	2026-02-14	\N	\N	39400.00	0.00	39400.00	3	completed	f	f	2026-04-04 21:22:26.316713	Yashodham	MTPLPI-000380 	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDP9F-PfE5XSZn5ZuUkYRPMAZCJ7edP1pvtGB8FAUrCycc?e=J3muog	\N
4	20251129-020	2025-11-29	236	Brochure	\N	Pages: 8\nJob Size: 9"x13"	\N	\N	\N	\N	0.00	0.00	3	long pending	f	f	2026-04-04 21:22:26.316713	Majestic Height	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBSzcvC1BJOSo18QDOpW4c5AU7tNugs5NE9BShOLfmSjxY?e=HioGHa	\N
5	20251127-012	2025-11-27	226	Paper Bag	300	Job Size: 11"x16"\nPaper: Art Paper\nGSM: 300\nLamination: Matt One Side	\N	\N	\N	20965.00	0.00	20965.00	3	long pending	f	f	2026-04-04 21:22:26.316713	The Jewel	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDfRiIncZIIRZ-oVU24dcoKAaOhDs-UwHixX2nQXrMVt-s?e=Fjt3Q6	Designing Charges : 2,000/-\nBoth side same design\nDepth: 3 in
6	20260122-106	2026-01-22	237	Visiting Cards	1000	\N	\N	\N	\N	2870.00	1000.00	1870.00	5	completed	f	f	2026-04-04 21:22:26.316713	Ghazi Darbar Caterers	MTPLPI-000369	MTPL2526-00305	https://1drv.ms/f/c/76a84e29c858ad5a/IgDlyi8o0-hHTpMbxpk-sY0eAe5Ff2qERGJSm1FFmwMzAlU?e=ujhpON	\N
8	20251203-034	2025-12-03	25	Brochure	\N	Pages: 16\nJob Size: 9"x13"	\N	\N	\N	\N	0.00	0.00	5	long pending	f	f	2026-04-04 21:22:26.316713	Ajit	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCDLOoy-DgESIIFHUf81K--AWAvY22H1tcTq3WSuvKkOXY?e=3HKwZq	\N
9	20251204-037	2025-12-04	50	Wall Branding	13	Job Size: Mix sizes	\N	\N	\N	44100.00	0.00	44100.00	5	completed	f	f	2026-04-04 21:22:26.316713	Innovative Symphony	MTPLPI-000378	MTPL2526-00302	https://1drv.ms/f/c/76a84e29c858ad5a/IgDS13nUjJd8Tb_xSwunE_R_AenHJuZUl_jOWnk4ls_GVdo?e=j6grrK	Innovative Symphony\t\nDesigning\t12350\nNormal Flex\t22860\nStar Flex\t31750
10	20251204-038	2025-12-04	140	Wall Branding	\N	Job Size: Mix Sizes	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Innovative Harmony	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgA3Jm7paYU0RL2LXHT9SE8CAenmLuFAOstt1r1WXfNKV2Y?e=Z9mIbh	\N
11	20251205-041	2025-12-05	115	Brochure	\N	Pages: 24\nJob Size: 13"x9"	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Hari Srushti	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDRwbxXq4IRQIPi39SpC-LdAXKUeItnby5XNZEWPVun_ls?e=In6rzn	\N
12	20251211-052	2025-12-11	59	Company Profile	25	Pages: 20\nJob Size: A4\nPaper: Indian Art Card\nGSM: 300\nLamination: Matt on Cover	\N	\N	\N	12390.00	0.00	12390.00	5	completed	f	f	2026-04-04 21:22:26.316713	Fascinate Architects	MTPLPI-000374	 MTPL2526-00295	https://1drv.ms/f/c/76a84e29c858ad5a/IgAGl8R5Q_qgT5fpU_s1ahkeAaAQbCB73epGpMct8Pd3HzE?e=dF8xJS	\N
13	20251212-058	2025-12-12	37	Brochure	\N	\N	\N	\N	\N	\N	0.00	0.00	5	long pending	f	f	2026-04-04 21:22:26.316713	Shelter Dreams	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgC3QCcelqcqTrMaBicByoAOATadWNpRObO5B-b_UvXYubw?e=aIHfk7	\N
15	20251219-069	2025-12-19	149	Wall Branding	\N	\N	\N	\N	\N	7500.00	0.00	7500.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vrundavan	MTPLPI-000371	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDqGj7J8JwTT7sKE5jg2DbNAZ_JRFkTm5352b4IsuNPez4?e=nbP8Xp	\N
17	20251225-077	2025-12-25	27	Visiting Cards	\N	\N	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Prishti Group	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAGcUJHq13vT4gX7CJzeqiuAYdaPU48GsuHZg49eDlCg7I?e=Ls9uUT	\N
18	20251229-082	2025-12-29	239	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Sai Mannat	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgC7_RDxuhl2SK4ht2Ql6EyWASHqTefDnT_P7BneX7Uuiyg?e=onCqLV	1 - Pole Kiosk - 8 designs\n2 - Standee - 3x5 feet - 1\n3 - Hoarding - 10x8 - 1
20	20251231-085	2025-12-31	241	Brochure	1000	Pages: 16\nJob Size: 13"x9"\nPaper: Fine Paper\nGSM: 270\nLamination: All pages Varnish	2026-02-02	\N	\N	182965.00	100000.00	82965.00	5	completed	f	f	2026-04-04 21:22:26.316713	Mangalmurti	MTPLPI-000360	MTPL2526-00293	https://1drv.ms/f/c/76a84e29c858ad5a/IgBxm5j493tHSqwapDO7xCcRAXmlnk2rusHFs5cOIwsadec?e=pzrvrf	1,71,755/- ka quotation diye the, baad me 3 pages me changes hone ki wajah se plate ka kharch 9,500/- badh gaya is tarah total amount ₹ 1,82,965/- ho gaya hai.
22	20260107-089	2026-01-26	242	Digital Brochure	\N	Pages: 16\nJob Size: 9"x13"	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	SB Developers	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCgPT97KDacRJVZAZAgIQwBAeXbm_YIWgMZdCD0lQkJZgU?e=SS7YLa	\N
23	20260110-091	2026-01-10	137	Handbill/Leaflet	3000	Pages: single - front back\nJob Size: A4\nPaper: Indian Art Paper\nGSM: 170	\N	\N	\N	6900.00	0.00	6900.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vasant Leela	MTPLPI-000365	MTPL2526-00301	https://1drv.ms/f/c/76a84e29c858ad5a/IgD2vZKVX82aRbHfTbrrNzGpAXAIHfOL0XSWGwrqP0zMeLM?e=kYo88x	Size: A4 | Paper: 100 GSM | Front Back Printing | Qty: 3,000 | ₹ 6,900/- + GST\nProforma invoice me amount saheeh nahi hai. ₹ 6,900/- final amount lena hai.
24	20260110-092	2026-01-10	88	Company Profile	\N	Pages: 15\nJob Size: A4	\N	\N	\N	12000.00	0.00	12000.00	5	review	f	f	2026-04-04 21:22:26.316713	V R Builders	MTPLPI-000406	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCVH4D9445vQaEZ_VpAiV2bAc04FzutKiU5K6jfVW6DK7w?e=h259oJ	Designed for digital use
25	20260112-095	2026-01-12	26	Visiting Cards	500	\N	\N	\N	\N	1949.00	0.00	1949.00	5	completed	f	f	2026-04-04 21:22:26.316713	Plutonium Business Solutions 	MTPLPI-000372	MTPL2526-00297	https://1drv.ms/f/c/76a84e29c858ad5a/IgCvgp5Crz-zR4nhX-VZPIxQAURO8g7WNI2moH2fAltsY_E?e=TQ1g8f	\N
26	20260112-096	2026-01-12	238	Envelopes	500	Job Size: 9.5x13.5\nPaper: Indian Art Paper\nGSM: 170	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	SRB - A N ICON	 MTPLPI-000373	MTPL2526-00307	https://1drv.ms/f/c/76a84e29c858ad5a/IgB185O-xSuiQIdvmtr2mD7OAVpnqfljXs-8IMpH1a1Ez-M?e=ruzpcW	\N
27	20260113-097	2026-01-13	37	Envelopes	\N	Job Size: 9.5"x4.5"\nPaper: Alabaster\nGSM: 100	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Shelter Builders	\N	MTPL2526-00326	https://1drv.ms/f/c/76a84e29c858ad5a/IgC7_RDxuhl2SK4ht2Ql6EyWASHqTefDnT_P7BneX7Uuiyg?e=onCqLV	\N
16	20251222-071	2025-12-22	88	Other - Visiting Card Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	V R Builders			https://1drv.ms/f/c/76a84e29c858ad5a/IgDmUsZnDlbxRbZhgyLA1UAmAXPm-aPUh_cSskIqBJNxMiU?e=FEN7Jv	\N
21	20260105-087	2026-01-05	240	Designing	\N	Job Size: 20x20	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vishwa Sky High	\N	MTPL2526-00299 	https://1drv.ms/f/c/76a84e29c858ad5a/IgAEibx7ElWHTa2u6lnPs0UCAYm6_aGyOPbAg7htAl6PSww?e=8R4A3Z	Hoarding 20x20
19	20251229-083	2025-12-29	240	Designing	\N	Job Size: 41x10 feet	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vishwa Sky High	\N	MTPL2526-00299	https://1drv.ms/f/c/76a84e29c858ad5a/IgBGo_7zqoVnT6DpafWgFGpaARW3cl_ZGPMqs9DgVJwYK8I?e=dOCqGh	\N
2	20260126-112	2026-01-26	7	Digital Brochure		Pages: 10\nJob Size: A4\nPaper: Indian Art Paper\nGSM: 170	\N	\N		0.00	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Balaji Heights	MTPLPI-000415	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAHEIH8MJtfQbiJG2MVBmhKAaGOhthUD4KECSqjnDQ2c3I?e=RvPag7	
7	20251202-033	2025-12-02	234	Digital Brochure		Pages: 8\nJob Size: 13"X9"	\N	\N		0.00	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Ayesha	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgA0iDnGU1MdTLkrbI1sRFkJAelDBpPFXQ3LkqizJL2pf8Q?e=R52qwB	
28	20260113-098	2026-01-13	37	Other - Plastic File Folder	\N	Job Size: Legal	\N	\N	\N	6726.00	0.00	6726.00	5	review	f	f	2026-04-04 21:22:26.316713	Shelter Builders	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAE1sd2NIfmQ4qhxJnz8GDaAYh_e_MGDR8zvkOC91I5RBc?e=bwIjBp	\N
29	20260120-102	2026-01-20	29	Sale Display	\N	\N	\N	\N	\N	9145.00	0.00	9145.00	5	completed	f	f	2026-04-04 21:22:26.316713	Shreeji Z Plus	MTPLPI-000367 	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgB4uveJSgFGSIjBgFP-dTsKAXFD3v-ZOpL2seItMqiezvo?e=iwh1WK	\N
30	20260120-103	2026-01-20	243	Digital Brochure	\N	Pages: 4\nJob Size: A4	\N	\N	\N	7500.00	0.00	7500.00	5	completed	f	f	2026-04-04 21:22:26.316713	Zainab Residency	\N	MTPL2526-00278	https://1drv.ms/f/c/76a84e29c858ad5a/IgC3qNQPNTfDTLzyhSP0liJ_AQrE9D1D7vm_bXIXcMstlEg?e=Lywzul	\N
31	20260120-104	2026-01-20	240	Handbill/Leaflet	\N	Pages: single side\nJob Size: A4	\N	\N	\N	1000.00	0.00	1000.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vishwa Sky High	\N	MTPL2526-00299	https://1drv.ms/f/c/76a84e29c858ad5a/IgAdb4-9sOO7QJP3JLR9jqpnAQQLPd3WSfs074AI_CAmQZc?e=prL1vc	\N
32	20260121-105	2026-01-21	244	Letterheads	5000	Job Size: A4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	11030.00	0.00	11030.00	5	completed	f	f	2026-04-04 21:22:26.316713	Dr. Vishal Chafale	MTPLPI-000370	MTPL2526-00285	https://1drv.ms/f/c/76a84e29c858ad5a/IgAT8PNGJluWT7m78TWSroKFAc7cIpBHbNUlT9dIV4gwEh4?e=j9OMsM	Loose Sheet
33	20260122-107	2026-01-22	240	Wall Branding	10	Job Size: 8x6	\N	\N	\N	10000.00	0.00	10000.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vishwa Sky High	\N	MTPL2526-00299	https://1drv.ms/f/c/76a84e29c858ad5a/IgAz9x7I_T64QK_A7FcMfbt6AZpq01pHVfu4vNuZAD9rxiE?e=k5X9xh	\N
34	20260122-108	2026-01-22	7	Brochure	\N	Pages: 36\nJob Size: 11"x11"\nPaper: Fine Paper MB\nGSM: 270	2026-03-27	\N	\N	\N	0.00	0.00	5	ready at office	f	f	2026-04-04 21:22:26.316713	Balaji Heights	MTPLPI-000415	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCqF9Fco5mrSK8-Y1MJv5giAYq_50DqpBIm394WVebsMyU?e=POcN1H	\N
35	20260124-109	2026-01-24	140	Designing	\N	Job Size: 16x8 feet	\N	\N	\N	1770.00	0.00	1770.00	5	completed	f	f	2026-04-04 21:22:26.316713	Innovative Montana	MTPLPI-000382	MTPL2526-00303	https://1drv.ms/f/c/76a84e29c858ad5a/IgB4DNk9NvZfTYQ1sibGZqK_AZ9U5Gvx-EsCxnzR9uLvj3E?e=KElC9z	\N
36	20260124-110	2026-01-24	219	Digital Brochure	\N	Pages: 12\nJob Size: 9"x13"	\N	\N	\N	23600.00	10000.00	13600.00	5	review	f	f	2026-04-04 21:22:26.316713	Ganesha Amol	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCXaVMUwsS0TJWo-W-wIi89AWUwHC18z5i-Dnw6mkzQR2Y?e=T8bVIo	\N
37	20260124-111	2026-01-24	245	Large Format Print	1	Job Size: 10x5 feet	\N	\N	\N	1900.00	0.00	1900.00	5	completed	f	f	2026-04-04 21:22:26.316713	Varsha Civil Services	\N	MTPL2526-00280	https://1drv.ms/f/c/76a84e29c858ad5a/IgDvlJ0xo6JmRLAIG0cT7ErfAfHVCJKG-jdj0ikcsu2Qwz8?e=YSE4RE	Designing and printing
39	20260126-115	2026-01-26	63	Visiting Cards	2000	\N	\N	\N	\N	4500.00	0.00	4500.00	5	completed	f	f	2026-04-04 21:22:26.316713	Al Ifrah International	MTPLPI-000375	MTPL2526-00324	https://1drv.ms/f/c/76a84e29c858ad5a/IgCnnB5YcZ8ESb2sviBXEmocAT1fCz4fCW9s27EE8d_W1Io?e=Cb4FOr	\N
40	20260127-116	2026-01-27	138	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Nandita Bhandari Invitation	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCO25uoHtjfSLPh99sNcB-GAZ4BdbW4oJSJlPp3z3Ns4nE?e=6lwqlI	\N
41	20260127-117	2026-01-27	190	Visiting Cards	2000	Paper: Art Paper\nGSM: 350	\N	\N	\N	4500.00	0.00	4500.00	3	completed	f	f	2026-04-04 21:22:26.316713	Dreams Property	\N	MTPL2526-00286	https://1drv.ms/f/c/76a84e29c858ad5a/IgBy8LWQQYk8QZ00Vqp-FlZsASSJOZaxUD9SImATHHlTZSI?e=yFLm51	Both side printing
42	20260127-118	2026-01-27	246	Other - Appointment Card	1000	Pages: 4\nJob Size: 7"x4.5"\nPaper: Card Paper\nGSM: 210	2026-01-31	\N	\N	2841.00	0.00	2841.00	3	completed	f	f	2026-04-04 21:22:26.316713	Aradhna Dental Clinic	\N	MTPL2526-00291	https://1drv.ms/f/c/76a84e29c858ad5a/IgAYF21kuhkbTrNztiZPIdU4ATB218FvirUhx3BZU9cVdQw?e=MVs1Il	\N
43	20260129-119	2026-01-29	21	Other - Hoarding design	1	Job Size: 12x8	\N	\N	\N	\N	0.00	0.00	3	long pending	f	f	2026-04-04 21:22:26.316713	Shree Ganesh Krupa	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBdZdciN8ngT5qpF7zGe0kTAbOENFt6taW44wVyTCwUVv8?e=EhOPzp	\N
44	20260129-120	2026-01-29	235	Brochure	100	Pages: 8\nJob Size: A/4\nPaper: Indian Art Paper\nGSM: 300	2026-01-31	\N	\N	20600.00	0.00	20600.00	3	completed	f	f	2026-04-04 21:22:26.316713	Monarch Brookfields	\N	MTPL2526-00289	https://1drv.ms/f/c/76a84e29c858ad5a/IgAET6jmT1CoT6VMc-g3YtmvAVVKxmMdSFMgAHldWRBECKM?e=fdjYJM	\N
45	20260129-121	2026-01-29	121	Brochure	300	Pages: 12\nJob Size: 9"x13"\nPaper: Fine Paper MB\nGSM: 350	2026-02-24	\N	\N	64945.00	0.00	64945.00	3	completed	f	f	2026-04-04 21:22:26.316713	H D  Elite	MTPLPI-000392	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBG2BaRJPoWSJx9a2QR_z7MAYh6L_9xl1NGk5BkwgQk0E8?e=4jNSXi	H D Elite\nPlot No. 150+151, Sector 2, Taloja, Navi Mumbai.
46	20260129-122	2026-01-29	165	Brochure	\N	Pages: 12\nJob Size: 9"x13"\nLamination: Cover Matt Lamination	2026-03-12	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Unique Avenue & Unique Avenue B	MTPLPI-000403	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgB6xWhXWFhfSLngEesEtMZMAUmktOcOIIAO8ZbcdZKraTI?e=RFF5gj	Combined brochure of Unique Avenue+ Unique Avenue B 
48	20260130-124	2026-01-30	247	Large Format Print	2	Job Size: 12"x17"	\N	\N	\N	1780.00	0.00	1780.00	3	completed	f	f	2026-04-04 21:22:26.316713	 Prayer Area - Fazal Clinic	\N	MTPL2526-00298	https://1drv.ms/f/c/76a84e29c858ad5a/IgDsyWYPRdR8Sp3aKa31bEU-Af2a04pAOo2APbInecmvshM?e=FTzDbv	Client ne kaha hai ke ek vinyl with sunboard chahiye and ek flex chahiye.\nDr. Faraz\n₹ 850/- Designing\n₹ 600/- Sunboard\n₹ 330/- Vinyl\n———— \n₹ 1,780/-\n
49	20260130-125	2026-01-30	202	Designing	2	Job Size: A4	\N	\N	\N	2000.00	0.00	2000.00	3	completed	f	f	2026-04-04 21:22:26.316713	Monthly Activity Planner CBSC/SSC 	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDy3RMtgpGnQ4V66jxM6yvPAc2hYPZdZDCp_YdAXxPzJ8o?e=phZS1v	Our Heritage Topic CBSC/ SSC both same design\n1 - February Design Completed\n
51	20251225-079	2025-12-25	111	Domain/Hosting/IT Services	\N	\N	\N	\N	\N	22032.00	0.00	22032.00	5	completed	f	f	2026-04-04 21:22:26.316713	SKA Arch	MTPLPI-000355	MTPL2526-00288	https://1drv.ms/f/c/76a84e29c858ad5a/IgCWsyjw7c8bRqyg7XfINldaARNHdJuUX28wu28XuvvWZN0?e=sNVKZl	Email and Hosting Service\nMTPL2526-00288\nMTPL2526-00287
53	20260131-128	2026-01-31	248	Designing	\N	\N	\N	\N	\N	3500.00	0.00	3500.00	3	completed	f	f	2026-04-04 21:22:26.316713	Chowdhary Engineering Works	\N	MTPL2526-00290	https://1drv.ms/f/c/76a84e29c858ad5a/IgCZkpOb3FrASbBGfzQQRt28AdFHuiPx5_084JBLNBZweXY?e=ddllUk	\N
52	20260131-127	2026-01-31	248	Designing	\N	\N	\N	\N	\N	3500.00	0.00	3500.00	3	completed	f	f	2026-04-04 21:22:26.316713	Drillboss Infra Projects	MTPLPI-000384	MTPL2526-00309	https://1drv.ms/f/c/76a84e29c858ad5a/IgDfhkf1w6dfTbD5bp4lvSrwAZ6xVmGbXdJ3wY8jeBBcA3E?e=pzHyL1	\N
38	20260126-114	2026-01-26	240	Wall Branding	10	Job Size: 8x6 feet	\N	\N	\N	10000.00	0.00	10000.00	5	invoice pending	t	f	2026-04-04 21:22:26.316713	Vishwa Sky High	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDvjyeWyGilRJDZja7AMeAQAepYKwYhUwfcRh3z2EwbNlg?e=On9N3a	\N
55	20260202-130	2026-02-02	137	Brochure	\N	Pages: 16\nJob Size: 9"x13"\nPaper: Fine Paper MB\nGSM: 270\nLamination: Varnish	\N	\N	\N	\N	0.00	0.00	3	negotiation	t	f	2026-04-04 21:22:26.316713	Gardenia	MTPLPI-000381	MTPL2526-00301	https://1drv.ms/f/c/76a84e29c858ad5a/IgBG3BXDXYTGTJ6vzdHayWz3AQOG0lUsvUQkbB093EVmhvs?e=77VlFb	\N
57	20260202-132	2026-02-02	249	Other - Poster Design	\N	Job Size: 17"x27"	\N	\N	\N	2000.00	0.00	2000.00	5	long pending	t	f	2026-04-04 21:22:26.316713	Annual Program	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgANtykM8keDQadmwes9Ze5BAdooVgrkqlXDy3zpYQFRRSQ?e=txoPWf	\N
59	20260205-134	2026-02-05	129	Brochure	\N	\N	\N	\N	\N	\N	0.00	0.00	5	long pending	f	f	2026-04-04 21:22:26.316713	Joy 24	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBEzyNcCkVVTb5hfTupKX3IAQZbGkLTyes4AESiF__DpDc?e=YFvsRj	\N
62	20260205-136	2026-02-05	46	Designing	\N	\N	\N	\N	\N	5000.00	0.00	5000.00	5	completed	f	f	2026-04-04 21:22:26.316713	Vision Group Logo	MTPLPI-000377	MTPLPI-000377	https://1drv.ms/f/c/76a84e29c858ad5a/IgCLEqvpbbZ0QLu6kAwpSYJPARmxFvtrm4-jUkYIn2apn5k?e=hgs3sS	\N
63	20260207-137	2026-02-07	121	Paper Bag	500	Job Size: 16"x11"\nPaper: Indian Art Paper\nGSM: 300\nLamination: Matt Lamination	2026-03-12	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	HD Builder	MTPLPI-000405	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCznq-LuWDeTa9c5Dv67ukHAc2PG2lhwmNJkp1YXT3A-U8?e=sRvght	Paper Bag Heights 16” x Width 11” x Depth 3”\n₹ 14,175/- for 100 Bags (₹ 141.75 per bag)\n₹ 17,490/- for 200 Bags (₹ 87.45 per bag)\n₹ 20,965/- for 300 Bags (₹ 69.88 per bag)\n₹ 28,615/- for 500 Bags (₹ 57.23 per bag)\n\n₹ 48,130/- for 1000 Bags (₹ 48.13 per bag)\nGST Extra
64	20260209-138	2026-02-09	167	Stickers	300	Job Size: 5x4 CM\nPaper: Others	\N	\N	\N	770.00	0.00	770.00	5	completed	f	f	2026-04-04 21:22:26.316713	The Jewel Rera Sticker 	MTPLPI-000379	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAv-gdnKJFxRYCUak4wA7YoAeasQ3hBvq4maQi3Q4mhKBk?e=zyLYQj	\N
65	20260209-139	2026-02-09	136	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	3	invoice pending	f	f	2026-04-04 21:22:26.316713	Krishna Valley Avyukta & Anaya Plan	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCtw-TWSpYUTreghEftSyt_AQVhsIXOfWmU__9mEIikEEk?e=gQvJGF	Krishan Valley Plan i) Ananta ii) Anaya iii) Avyukta\nTeno Plan Rooshish ko Whatsapp Bheja gaya hai Proofing main\nRooshish Bola Hai Check kar ke Batat Hon
66	20260210-140	2026-02-10	153	Domain/Hosting/IT Services	\N	\N	\N	\N	\N	2950.00	0.00	2950.00	5	completed	f	f	2026-04-04 21:22:26.316713	orangebuilders.in	\N	MTPL2526-00300	https://1drv.ms/f/c/76a84e29c858ad5a/IgAp3hE_QiGaRqOmm4BlrVB4AaobdJUW953VY8KN2yVXMSU?e=9ekrQP	\N
67	20260210-141	2026-02-10	63	Other - Lanyard 	200	Job Size: 20 mm	2026-02-24	\N	\N	10000.00	0.00	10000.00	3	completed	f	f	2026-04-04 21:22:26.316713	Lanyards	MTPLPI-000393	MTPL2526-00324	https://1drv.ms/f/c/76a84e29c858ad5a/IgA8B5swBXObQrizilPx12ChAc0H8gSOOlLZ5vwJP5lGK3o?e=ejhfnP	lanyard 20 mm Digital Printing with Fish Hook \nPorter Charge 248 for sample collect
69	20260210-143	2026-02-10	95	Other - Floor Plan (insertion)	1000	Job Size: A/4\nPaper: Fine Paper MB\nGSM: 130\nLamination: Varnish	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Shivshakti Prime	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgArJ3BgEpfuTZ6iGdBkFfYaAeJ49XYfDRCR-ZvHI_cwtsQ?e=A22Kyn	\N
70	20260211-144	2026-02-11	251	Visiting Cards	\N	\N	2026-02-20	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Asil Infracon LLP	MTPLPI-000391	MTPL2526-00321	https://1drv.ms/f/c/76a84e29c858ad5a/IgDNuczefleJQp-dKCNhT7QMAeSZWv3YOtNM-rpBCBVMmkg?e=Jus4eM	Option 1 - Embossed Gold Foil\nVisiting Card\nOne Side Printed\nDesigning Charges \nRs: 1,000/- + GST\n\nPrinting Charges\n₹ 5,200/- for 500 cards\n+ GST Extra
71	20260211-145	2026-02-11	237	Large Format Print	1	Job Size: 9'x4'	\N	\N	\N	\N	0.00	0.00	3	quotation	t	f	2026-04-04 21:22:26.316713	Ghazi Darbar Board	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgD0GPti18iVS6TX2O5jjxTOAXDmYlJeV8m0dqCQIlGMroo?e=VXEMJX	1 - Board - Norma Flex - 101x42inch  9x4 (36 x 18/-)- 648/-\n2 - Standy - Normal Flex - 2.5x5 - Qty - 2 (30x 18/-Rate) 540/-\n    Flex Amount - 1188/-\n3 - GI Pipe + Installation & Pasting  5100/-\n4 - Design Baord 1000/-\n5 - Standy Design - 1000/-\nTotal Amount - 8288/- + 18 GST \nTotal - 9,779.84/-\n\n1 - Board - Star Flex - 101x42inch  9x4 (36 x 25/-)- 900/-\n2 - Standy - Star Normal Flex - 2.5x5 - Qty - 2 (30x 25/-Rate) 750/-\n    Flex Total - 1650/-\n3 - GI Pipe + Installation & Pasting  5100/-\n4 - Design Baord 1000/-\n5 - Standy Design - 1000/-\nTotal Amount - 8750/-\nTotal - 10,325/-\n\n (Ladder provide by client)
72	20260211-146	2026-02-11	252	Other - Logo Design	\N	\N	\N	\N	\N	5000.00	2000.00	3000.00	3	long pending	f	f	2026-04-04 21:22:26.316713	Sai Enterprises 	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDfq-CI6f8bQK4JiYkKUUjuAThcQYYzA4NuuLc-1EIx_Cc?e=8a7zy6	\N
73	20260212-147	2026-02-12	226	Large Format Print	1	Job Size: 42"x17.5"	\N	\N	\N	\N	0.00	0.00	3	long pending	f	f	2026-04-04 21:22:26.316713	Kohinoor - Skyline	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBH8Bse55W2TovXGIIT-zS6AeMZN5lcDcfqJ1Cn9y9cF-c?e=xmU63r	Silver Metalic Eco Solvent Print
74	20260212-148	2026-02-12	244	Receipt	2000	Job Size: 297x105 mm\nPaper: Alabaster\nGSM: 100	2026-02-19	\N	\N	4515.00	-0.01	4515.01	3	completed	f	f	2026-04-04 21:22:26.316713	Neuron Clinic (Dr. Vishal Chafale)	MTPLPI-000385	MTPL2526-00319	https://1drv.ms/f/c/76a84e29c858ad5a/IgATWI_To2TPTbjgBJe3m6jUAYATbon-NQxZ5FvCiTeFp0A?e=81JmvR	₹ 4,515/- + GST for 2000 (20 Books of 100 pages) Paper: 100 GSM Alabaster\nNumbering : 001
75	20260217-149	2026-02-17	138	Other - Website	\N	\N	\N	\N	\N	\N	0.00	0.00	5	review	f	f	2026-04-04 21:22:26.316713	Website	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAH-U2k87Z0S6yL3wccpZGDAezkBKt9gs_sYH9m3S-jaKE?e=0vc9nk	\N
60	20260205-135	2026-02-05	111	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Hiring		\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCy3K6r7eBZQoRQZewBZQMvATjIBdVBuJ9e4MgxLpg1LWI?e=IRFGwR	\N
76	20260217-150	2026-02-17	253	Visiting Cards	\N	\N	2026-02-26	\N	\N	8000.00	0.00	8000.00	3	completed	f	f	2026-04-04 21:22:26.316713	GRK Infra Developer	MTPLPI-000395	MTPL2526-00317	https://1drv.ms/f/c/76a84e29c858ad5a/IgDg37xjwcV6T7uFUEG55b5vAaAglToAYkAXes3JIuT1Xv0?e=Ha0Zuk	NILESH   9223368103\nKUMAR  9820377717\nRAJIV     9821060303
77	20260217-151	2026-02-17	138	Letterheads	500	Job Size: A/4\nPaper: Alabaster\nGSM: 100	2026-02-18	\N	\N	4200.00	0.00	4200.00	3	completed	f	f	2026-04-04 21:22:26.316713	\N	MTPLPI-000389	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAvigULr8I9QpS4_GZZXZrEASfZZxudWLuBtMWhHN-tAX8?e=H7UaYf	Job Name : Veendeep \nJob Type: Letter Head\nPaper: Alabaster 100gsm\nSize: A4\nQty: 502\nNote : Best Quality Required printing in Print Plaza\nVendor Rate 4.00/ per Letter Head
78	20260217-152	2026-02-17	206	Coffee Table	\N	Paper: Indian Art Card\nGSM: 300\nLamination: Matt Lamination	2026-02-23	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	SAI NEEL RIDDHI EMPIRE	MTPLPI-000388	MTPL2526-00310	https://1drv.ms/f/c/76a84e29c858ad5a/IgB4ni5jumebRZ_2CQ8wq2FLAeoW9XGR7NvQMSUZVEWBRPY?e=H4Sdsn	Printed on art card withThermal matt lamination and central stitching\n₹6,600/- + GST for 3 Coffee Tables\n
79	20260218-153	2026-02-18	84	Envelopes	\N	Job Size: 10x14 inch\nPaper: Alabaster\nGSM: 100	2026-05-03	\N	\N	\N	0.00	0.00	1	completed	f	f	2026-04-04 21:22:26.316713	Life Space Builders LLP	MTPLPI-000399	MTPL2526-00320	https://1drv.ms/f/c/76a84e29c858ad5a/IgDzS0g1CR4ES6lhT53bn_o7AY-SPVNVB_H89d_2neEFiME?e=TlGldi	\N
80	20260219-154	2026-02-19	254	Other - Tajani Flyer A/4 Four Fold	\N	Job Size: A/4	\N	\N	\N	3000.00	0.00	3000.00	3	review	f	f	2026-04-04 21:22:26.316713	Tajani Metal And Alloys	MTPLPI-000400	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAQjf4X7ZZaRq3xV316Il_xAaiJUvIJBaTYFJYo-CRo4s8?e=29taDE	Size : A4 (Tri Fold)\nDesigning Charges \nRs.: 3,000/- + GST Extra
82	20260221-156	2026-02-21	239	Other - LED 	1	Job Size: 972x972 px	\N	\N	\N	\N	0.00	0.00	1	invoice pending	f	f	2026-04-04 21:22:26.316713	Sai Mannat	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDQVLk4GQU6Q6ORAdD7saVfAZJvfA4n8_u_-8CZltC5rPo?e=B3LAWs	\N
83	20260221-157	2026-02-21	229	Other - Cash / Debit Voucher	1000	\N	\N	\N	\N	1265.00	0.00	1265.00	3	negotiation	t	f	2026-04-04 21:22:26.316713	HITECH STRUCT CON	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDwcpeJJ4SDTaI4ngGbp9pdAc6jKMw2a1AJ5G9Sg4uNOzM?e=VkeSZI	\N
84	20260221-158	2026-02-21	132	Brochure	\N	Pages: 20\nJob Size: 9"x13"\nPaper: Fine Paper MB\nGSM: 270\nLamination: All pages	\N	\N	\N	\N	0.00	0.00	5	printing	f	f	2026-04-04 21:22:26.316713	Abri Crystal	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCgVeN77qjKTYoB5PnHJOqbAXA3Az226b4GcptHkFm3e4w?e=3SlEfv	\N
87	20260228-161	2026-02-28	235	Paper Bag	\N	Job Size: 16 x 11 x 3 inch\nPaper: Indian Art Paper\nGSM: 250\nLamination: Matt Lamination Single Side	\N	\N	\N	\N	0.00	0.00	1	review	f	f	2026-04-04 21:22:26.316713	Planet Builders	\N	\N	\N	\N
88	20260228-162	2026-02-28	255	Designing	\N	\N	\N	\N	\N	2500.00	0.00	2500.00	5	completed	f	f	2026-04-04 21:22:26.316713	Stationery Design	MTPLPI-000396	MTPL2526-00313	https://1drv.ms/f/c/76a84e29c858ad5a/IgAXpbe_FVHdSr1YZxuB2HODAXQ-7f6h-AlYj2b1pZ5uWCE?e=bYmq2R	\N
89	20260302-163	2026-03-02	13	Letterheads	1000	Job Size: A4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Sadguru Associates	MTPLPI-000334	MTPL2526-00330	https://1drv.ms/f/c/76a84e29c858ad5a/IgASrq3KBnsUS6Jxwp4JZV98AUmAVWYNhp-xlcZZB-ye8VM?e=PikRVi	\N
90	20260302-164	2026-03-02	250	Company Profile	300	Pages: 16\nJob Size: A4\nPaper: Fine Paper\nGSM: 270\nLamination: All Pages Gloss Varnish	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Advik Realty Company Profile Printing	MTPLPI-000397	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDhswHF247VSbnJZaonZmBHAe9XmPdW29_dTH61k4EELPw?e=ZNPwsb	\N
91	20260302-165	2026-03-02	256	Designing	\N	\N	\N	\N	\N	24000.00	0.00	24000.00	3	negotiation	f	f	2026-04-04 21:22:26.316713	Skyline Prime - Hannan Kashmiri	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgB9CwM85EkBS6tScYhf7oD2AVUoPd8Bf9Zw49ZUjgCMjsw?e=n0IhW8	\N
92	20260302-166	2026-03-02	257	Domain/Hosting/IT Services	\N	\N	\N	\N	\N	2478.00	0.00	2478.00	5	completed	f	f	2026-04-04 21:22:26.316713	GAJINFRA.COM	MTPLPI-000398	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCS45uuwXQZTI9hVadQhXZVAR8ybZviZP7FDh7TuCMeAAU?e=i7uG5d	\N
93	20260304-167	2026-03-04	248	Other - Letter Head & Visiting Card	\N	\N	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Drillbos Stationery	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAqdyYXnIUUR7gavMamjiVeAUAE8T-l1Opbwmic_Dy-OQw?e=dvbVPl	Letter Head  ----  Drill Boss \nVisiting Card ---- Drill Boss\nLetter Head  ----  Chowdhri\nVisiting Card ---- Chowdhri
94	20260305-168	2026-03-05	127	Other - One Way Vision	2	Job Size: 11x8	\N	\N	\N	\N	0.00	0.00	3	negotiation	t	f	2026-04-04 21:22:26.316713	\N	\N	\N	\N	Site Address Vashi
95	20260307-169	2026-03-07	250	Envelopes	300	Job Size: A4\nPaper: Fine Paper [JR-RNDZ105]\nGSM: Other (105)	2026-03-08	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Envelope	\N	\N	\N	\N
96	20260309-170	2026-03-09	137	Large Format Print	2	Job Size: 20x10	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Gardenia	MTPLPI-000410	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBtCKvO6oUvRaZgnWyFLxLtAU_ECYAz8vsow2x9PL8_Aw4?e=ztJhxM	\N
97	20260309-171	2026-03-09	137	Large Format Print	1	Job Size: 15x8	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Vasant Leela	MTPLPI-000410	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBb31H-in_xRa12wPDfS12IAWRvSD6b_RnAA0brmQNabEI?e=0F3epb	\N
98	20260310-172	2026-03-10	258	Brochure	\N	Pages: 16\nJob Size: 9.5x13.5	2026-03-18	\N	\N	32000.00	0.00	32000.00	3	designing	f	f	2026-04-04 21:22:26.316713	Sky Elite	MTPLPI-000404	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDganyiyLUqRaeWILiikK-OAU9TYJ4JS23Qk98bWDa_-5c?e=8SNCaG	Brochure Designing\nPages: 16\nSize: 9"x13"\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF,\nJPEG
99	20260310-173	2026-03-10	258	Wall Branding	10	Job Size: Multiple Sizes	2026-03-18	\N	\N	17700.00	0.00	17700.00	3	review	f	f	2026-04-04 21:22:26.316713	Sky Elite	MTPLPI-000404	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDPIlKO3DP8RpSzC431Ch1RAYISkJKUuA898aQtJ6Hqr5s?e=gHRy8l	Wall Branding\nMultiple Sizes\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF,\nJPEG\n\nSizes :\n95x143\n95x113\n87x143\n95x77
100	20260310-174	2026-03-10	260	Letterheads	500	Job Size: A4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Shelter Builders	\N	MTPL2526-00327	https://1drv.ms/f/c/76a84e29c858ad5a/IgDSC8cEA4cJSbZ3DICG6fzuAfLwz8Sn53W9itYQWapTV5A?e=1Rrhfd	\N
101	20260311-175	2026-03-11	261	Company Profile	\N	Pages: 12\nJob Size: A4	2026-03-17	\N	\N	22000.00	10000.00	12000.00	3	review	f	f	2026-04-04 21:22:26.316713	 Skyline Contractors	\N	\N	\N	 Skyline Contractors\nRe-Designing Rate (Soft Copy only) \n\nPages: 8       Rs.: 14,000/- + GST\nPages: 12     Rs.: 24,000/- + GST\n\nDesign Schedule : Requirted 4 to 5 working days.\n\n
102	20260312-176	2026-03-12	262	Large Format Print	\N	Job Size: 10x10	\N	\N	\N	1200.00	0.00	1200.00	3	completed	f	f	2026-04-04 21:22:26.316713	Nirmaan Aishwaryam	MTPLPI-000412	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBgXEhHV68qQZhHfz_vXbrLAV-i7yHGmm8hTfbmh22IlFg?e=ets5Hd	Flex design marathi me rahega client ne content share kiya hai whats up par
103	20260313-177	2026-03-13	202	Designing	1	Pages: 1	\N	\N	\N	1000.00	0.00	1000.00	3	completed	f	f	2026-04-04 21:22:26.316713	Monthly Activity Planner SSC	MTPLPI-000414	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgB4dRxT7-OqR63FEnBAKKQhAU6UGxqg2L2XwdMZGSXbtLg?e=VpfCmk	Job completed
104	20260314-178	2026-03-14	266	Letterheads	1000	Job Size: A4\nPaper: Alabaster\nGSM: 100	2026-03-18	\N	\N	3415.00	0.00	3415.00	5	completed	f	f	2026-04-04 21:22:26.316713	Dr. Faris Khan Letterhead	MTPLPI-000409	\N	\N	PAD Binding karna hai
105	20260316-179	2026-03-16	11	Letterheads	1000	Job Size: A4\nPaper: Alabaster\nGSM: 100	2026-02-03	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Supermax Boiler Engineers	MTPLPI-000407	MTPL2526-00328	https://1drv.ms/f/c/76a84e29c858ad5a/IgCI23TDxSf2RaTiaQlEX6WVAdiF1HOcPk7wU6IGTR3ysVI?e=bF6AvU	Super Max Boiler Engineers\n022-27401786 / 9223579400
106	20260316-180	2026-03-16	265	Designing	\N	Job Size: 10x14	\N	\N	\N	1652.00	0.00	1652.00	3	completed	f	f	2026-04-04 21:22:26.316713	 Ideal Residency	MTPLPI-000413	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgCj55QmL_P1RbVAHPJajaLVAYt0zHS-WAO7y9E0SoW0y6c?e=oWocZj	\N
107	20260317-181	2026-03-17	115	Wall Branding	\N	\N	\N	\N	\N	\N	0.00	0.00	3	negotiation	f	f	2026-04-04 21:22:26.316713	Hari Shrushti	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgB6jeAaIGqKRrpiLjc_JZB0AYpBouTcsMEZacQK5vTssDE?e=9eRIyg	\N
108	20260317-182	2026-03-17	29	Sale Display	\N	Job Size: A3	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Z - Plus	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAq004evjZbRoA_kHPyfYAGAcEvU2RsLQUFUqZNtXoUOiY?e=NgTVeW	\N
109	20260317-183	2026-03-17	132	Letterheads	500	Job Size: A4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	1680.00	0.00	1680.00	3	completed	f	f	2026-04-04 21:22:26.316713	Abri realty	MTPLPI-000411	MTPL2526-00329	https://1drv.ms/f/c/76a84e29c858ad5a/IgBdyil84hsuRa6GXVvmd_QiAfIq-_0usk_VS4tWX3ToIsQ?e=83JJMG	\N
110	20260318-184	2026-03-18	37	Envelopes	500	Job Size: 9.5 x 4.5\nPaper: Alabaster\nGSM: 100	\N	\N	\N	\N	0.00	0.00	3	negotiation	t	f	2026-04-04 21:22:26.316713	Shelter Builders & Developers	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAQYe7BTRQGTZQEMbIDL1huATB_mq_kGFsoAgaXyqRKBtc?e=QrmKRW	\N
111	20260318-185	2026-03-18	37	Other - Plastic Folders	500	Job Size: 9.5 x 14	\N	\N	\N	\N	0.00	0.00	3	negotiation	t	f	2026-04-04 21:22:26.316713	Shelter Builders & Devlopers	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBoyMwA5UVyTr0H4LngKRkjAa3JtCpeWJz1O1jbGb4KHAw?e=CJuDER	on folder Screen Printing
112	20260318-186	2026-03-18	255	Other - Stationery	\N	\N	2026-03-25	\N	\N	11381.00	11381.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Altamontt Realty LLP	\N	MTPL2526-00325	https://1drv.ms/f/c/76a84e29c858ad5a/IgDAzkp62WdjQq3dTjcVl4CEAVfv1x_qpzlxQAbmtwhFeSc?e=e3UOv8	Letter Heads - 500\nEnvelope - 500\nReceipt Book - 500 pages\nVisiting card - 1000
113	20260319-187	2026-03-19	111	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	SKA Gudi Padwa Post	MTPLPI-000408	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgAQpkdysEUTTZwOlljhjIBWATlFcD4USOART_Xw3Pv8q-4?e=MYX0sd	Isme humne pehle 3 design ka option share kiye they, but client ko pasand nahi aaya tha, phir usne ek sample share kiya tha uske similar bola tha banane keliye.
114	20260323-188	2026-03-23	255	Brochure	\N	Pages: 12\nJob Size: 9x13	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Altamontt Realty LLP 	MTPLPI-000418	MTPL2526-00332	https://1drv.ms/f/c/76a84e29c858ad5a/IgDCcwN6zq3GS6bYI5FohjYFAZl6mk7EYDpCEnqAl_CcWcg?e=W0ysA7	\N
115	20260323-189	2026-03-23	269	Designing	\N	\N	\N	\N	\N	\N	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Aqua Vista Buildcon LLP Logo  & Letterhead design	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBbPmhp-CPuR4KhO-c7V_o4AcvCjBOOE5sqivwcI0YYiR4?e=unj3Uh	logo & letterhead Design
116	20260324-190	2026-03-24	19	Other - Letter Head & Envelope	1000	Job Size: A4 & 9.5x4.5\nPaper: Alabaster Paper\nGSM: 100	2026-03-28	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Deep Laxmi Associates - Letterhead & Envelope	MTPLPI-000416	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDBXNvp2oBWQKaCxjwnfOTTAQf_vfdikZ1NDVJS5qFnr6Y?e=MTs9X7	₹ 2,248/- + GST - Letterhead\n₹ 2,814/- + GST - Envelopes
117	20260325-191	2026-03-25	230	Brochure	\N	\N	\N	\N	\N	\N	0.00	0.00	3	designing	f	f	2026-04-04 21:22:26.316713	Vitthaldham 	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgByblGFp18GSbvV2ZjPzVsqAQCzuUVNmWB8WZ6eEc2HdkM?e=IwZGLH	\N
118	20260327-192	2026-03-27	270	Other - Stationery & Board	\N	\N	\N	\N	\N	\N	2000.00	-2000.00	3	completed	f	f	2026-04-04 21:22:26.316713	SHREE YASH HARDWARE	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgA5X5UUKRqeRZWbiozHymzcAdqDIfOwhppwpeiP3KQEAAY?e=7cbVEf	Shree Yash Hardware / Marketing \n1 - Old Logo Recreation (HD Vector Format) – ₹1,500/- \n2 - Visiting Card Design HARDWARE – ₹1,000/- \n3 - Visiting Card Design MARKETING – ₹1,000/- \n4 - Main Board Design (Size: 9 x 3 ft) – ₹1,500/- \nTotal Amount Rs.: 5,000/- \nDiscount Rs.: 1,000/- \nFinal Amount Rs.: 4,000/- \nAdvance cash received      2000
119	20260327-193	2026-03-27	9	Letterheads	500	Job Size: A/4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	2310.00	0.00	2310.00	3	completed	f	f	2026-04-04 21:22:26.316713	Prapti Associates	MTPLPI-000417	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBkWnUaUEesQYuHrvSx0OW9AfMPvCqVlhZ1Y8UXkpqiXvU?e=A7yeON	\N
120	20260329-194	2026-03-29	266	Other - A4 Acrylic Display	1	Job Size: A4	\N	\N	\N	\N	0.00	0.00	5	negotiation	f	f	2026-04-04 21:22:26.316713	A4 Acrylic Display	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBAeDAg4lZkQ4aj_I5j0u0VAfKIetM682hOo1bztje-LaU?e=qP8RaT	\N
121	20260330-195	2026-03-30	69	Visiting Cards	100 Each	Paper: Tango Linen Ivory \nGSM: Other (280)	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	DenEB Air Gases	MTPLPI2627-000001	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBByWc-M-9dSox0kpZvrufDATY81bpvFT-QSBUq2r0Qsig?e=kwckfo	"Hotel Tunga" 1st Floor, Plot No. 88, 37, Sector 30A, Vashi, Navi Mumbai, denEB Air. Gases ka VC ye address par delivery kiye hai Urgent main.
122	20260331-196	2026-03-31	273	Designing	\N	Pages: 4	\N	\N	\N	\N	0.00	0.00	3	negotiation	f	f	2026-04-04 21:22:26.316713	Shirin Complex 	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgD8rXP_hLQJSIU55crEtT7CAdD-U1Kkk-I1xuDYoNHs5U0?e=zeOZQX	Only Brochure design 
14	20251213-059	2025-12-13	238	Brochure	500	Pages: 8\nJob Size: 9"x13"\nPaper: Fine Paper\nGSM: 270\nLamination: All Pages Varnish	\N	\N	\N	67250.00	0.00	67250.00	5	completed	f	f	2026-04-04 21:22:26.316713	SBR - AN Icon	MTPLPI-000373	MTPL2526-00307	https://1drv.ms/f/c/76a84e29c858ad5a/IgBeftt05e3oRa_BvC7H2MVHAbKwxOzQ9MiJ-LnpF8CJjzc?e=hxVVh1	AN Icon - Brochure with Envelopes Designing and Printing\n\nBrochure Pages: 8\nSize: 9"x13"\nPaper: 270 GSM Premium Fine Paper\n\nEnvelope: 9"x13"\nPaper: 120 GSM\n\n₹ 67,250/- for 500 brochures and 500 envelopes
123	20260401-197	2026-04-01	182	Other - ID Card			\N	\N		0.00	0.00	0.00	3	review	f	f	2026-04-04 21:22:26.316713	Marvel Travels 	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBdoEhnWxufQ7XSvOmwp7u8AQjt4cz2sdIeUPAkTsTu4Dw?e=qS99XX	
124	20260402-198	2026-04-02	278	Brochure		Pages: 8\nJob Size: 9"x13"	\N	\N		0.00	0.00	0.00	3	designing	f	f	2026-04-04 21:22:26.316713	Matheran River Valley	\N	\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgDSTwUs72LkTJiEF48SviSVASXjvmLnDTS6E-bCFqhmpSA?e=WclMBh	
125	20260402-199	2026-04-02	279	Brochure		Job Size: Challan Book A4 & Voucher A5	\N	\N		0.00	0.00	0.00	1	designing	f	f	2026-04-04 21:22:26.316713	Evershine Lifespace	\N	\N	\N	
86	20260225-160	2026-02-25	235	Other - Visit Form / Booking Form	100	Job Size: A/4\nPaper: Alabaster\nGSM: 100	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Monarch Brookfields		\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBY38vmb1F5RrPoyYm_KkIjASzKpuV7-uoFqJMcxlTN0RY?e=N0xGUP	Visit Form Pages = 2\nBooking Form Pages = 4
85	20260225-159	2026-02-25	235	Brochure	500	Pages: 8\nJob Size: A/4\nPaper: Indian Art Paper\nGSM: 350	\N	\N	\N	21755.00	0.00	21755.00	5	completed	f	f	2026-04-04 21:22:26.316713	Monarch Brookfields		\N	https://1drv.ms/f/c/76a84e29c858ad5a/IgBxgpoybXr6RqDulxNYki81AS_W88leJFmFK02Y_w3npJE?e=dGTFYV	\N
81	20260219-155	2026-02-19	115	Coffee Table	\N	Pages: 24\nJob Size: A3\nPaper: Fine Paper MB\nGSM: 130	\N	\N	\N	\N	0.00	0.00	1	completed	f	f	2026-04-04 21:22:26.316713	Hari Shrushti	\N	MTPL2526-00322	https://1drv.ms/f/c/76a84e29c858ad5a/IgBgyxrUr6L7RIuIH5jnaBXZAYIoiaqqmN7H9QGKY05rjjQ?e=J355s7	5 Coffee table ( Dhawal Patel )client le kar gaya hai . Ek coffee table me printing mistake tha isliye ek coffee table office par hai 
68	20260210-142	2026-02-10	250	Company Profile	\N	Pages: 16\nJob Size: A/4	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Advik Rrealty	MTPLPI-000383	MTPL2526-00311	https://1drv.ms/f/c/76a84e29c858ad5a/IgCKXMI6OKCwTYK_u-RC65yYASLTQEpH-b1wSmKbTWdbiLk?e=Nuhb64	Please note that this company profile is being created specifically to target redevelopment projects; the content for a general company profile is usually different.\n\nFor a 16-page company profile with concept design, the charges will be ₹28,800/- + GST (extra).
61	20260114-099	2026-02-05	241	Handbill/Leaflet	3000	Pages: Single\nJob Size: A4\nPaper: Indian Art Paper\nGSM: 170	\N	\N	\N	\N	0.00	0.00	5	completed	f	f	2026-04-04 21:22:26.316713	Mangalmurti	MTPLPI-000368	MTPL2526-00294	https://1drv.ms/f/c/76a84e29c858ad5a/IgAA5Wgef32cRquUY2VCTsKIAbeonDVVuRu18wD1GJFetls?e=3zDshe	\N
58	20260202-133	2026-02-02	137	Large Format Print	2	Job Size: 10'x10'	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Stall Design	MTPLPI-000376	MTPL2526-00301	https://1drv.ms/f/c/76a84e29c858ad5a/IgC98kkCZwS5R6e2obZkgP4AAZ2O6Qhd2FUmB5a40fLPBwM?e=bqbBAE	Stall Design \nStar Flex Print 10x10  Qty   2\nStar Flex Print 30x10  Qty  1\nStar Flex Print 10x6  Qty  1
56	20260202-131	2026-02-02	137	Large Format Print	\N	Job Size: 10'x6'	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Gardenia - Flex 10x6	MTPLPI-000376	MTPL2526-00301	https://1drv.ms/f/c/76a84e29c858ad5a/IgDqHH61xi_ZQrrmUOo75lP2AaLdREBtL9W0_Y-xHgZUIAs?e=ccA9H9	\N
54	20260202-129	2026-02-02	137	Handbill/Leaflet	3000	Pages: Single - Front Back\nJob Size: A4\nPaper: Indian Art Paper\nGSM: 100	\N	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Gardenia & Vasant Leela	MTPLPI-000381	MTPL2526-00301	https://1drv.ms/f/c/76a84e29c858ad5a/IgB2lODtmhRARYfcZbe0H96JAQMVO8EnNBJjc0IRPTf20kQ?e=nZix2Q	\N
50	20260130-126	2026-01-30	18	Letterheads	2000	Job Size: A4\nPaper: Alabaster\nGSM: 100	2026-02-04	\N	\N	\N	0.00	0.00	3	completed	f	f	2026-04-04 21:22:26.316713	Socomed Pharma Letter Heads	MTPLPI-000348	MTPL2526-00292	https://1drv.ms/f/c/76a84e29c858ad5a/IgBC2CVIONGFSYOTTM8M4uDqAWNYaIcqJrAFDhT70Tz_7pc?e=8Q1Uiu	Clients PO No. SPPL/OM/137/25-26 (Dtd. 6-Jan-26)
47	20260130-123	2026-01-30	235	Other - Cost Sheet	200	Job Size: A4\nPaper: Indian Art Card\nGSM: 300	2026-01-31	\N	\N	3900.00	0.00	3900.00	5	completed	f	f	2026-04-04 21:22:26.316713	Monarch Brookfield	\N	MTPL2526-00289	https://1drv.ms/f/c/76a84e29c858ad5a/IgCmV0XYhxYSSafbUflLVhKZATwhxqd5xea0S1ZcQvqFFSU?e=BxMfH6	\N
126	20260407-001	2026-04-07	281	Brochure			\N	\N		0.00	0.00	0.00	6	negotiation	f	f	2026-04-07 14:21:00.066862	Mannat Residency	\N	\N	\N	
127	20260409-001	2026-04-09	\N	Brochure Design & Print - Sai Majestic (Sai Mannat Client)	\N	\N	\N	\N	\N	\N	0.00	0.00	\N	negotiation	f	f	2026-04-09 22:50:16.17512	\N	\N	\N	\N	\N
128	20260409-002	2026-04-09	281	Digital Brochure		Skyline Contractors\nRe-Designing Rate (Soft Copy only) \n\nPages: 8       Rs.: 14,000/- + GST\nPages: 12     Rs.: 24,000/- + GST\n\nDesign Schedule : Requirted 4 to 5 working days	\N	\N		0.00	500.00	-500.00	6	quotation	f	f	2026-04-09 23:00:00.233393		\N	\N	\N	Nice
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.quotation_items (id, quotation_id, description, quantity, rate, amount, sort_order, item_name) FROM stdin;
2	2	Size: A4 | Pages: 24 | Art Card 350 GSM\nCover Laminated\nDesign Provided by: Client	500.00	126.55	63275.00	0	Brochure
3	2	Size: A4 | Pages: 24 | Art Card 350 GSM\nCover Laminated\nDesign Provided by: Client	1000.00	85.89	85890.00	1	Brochure
4	2	Size: A4 | Pages: 24 | Art Card 300 GSM\nCover Laminated\nDesign Provided by: Client	500.00	118.21	59105.00	2	Brochure
5	2	Size: A4 | Pages: 24 | Art Card 300 GSM\nCover Laminated\nDesign Provided by: Client	1000.00	78.27	78270.00	3	Brochure
6	2	Size: A4 | Pages: 24 | Imported 270 GSM\nAll Pages Varnish\nDesign Provided by: Client	500.00	220.74	110370.00	4	Brochure
7	2	Size: A4 | Pages: 24 | Imported 270 GSM\nAll Pages Varnish\nDesign Provided by: Client	1000.00	173.97	173970.00	5	Brochure
8	3	Size: A4 | Pages: 8 | Art Card 350 GSM\nCover Laminated\nDesign Provided by: Client	500.00	43.51	21755.00	0	Brochure
9	3	Size: A4 | Pages: 8 | Art Card 350 GSM\nCover Laminated\nDesign Provided by: Client	1000.00	29.95	29950.00	1	Brochure
10	3	Size: A4 | Pages: 8 | Art Card 300 GSM\nCover Laminated\nDesign Provided by: Client	500.00	40.73	20365.00	2	Brochure
11	3	Size: A4 | Pages: 8 | Art Card 300 GSM\nCover Laminated\nDesign Provided by: Client	1000.00	27.68	27680.00	3	Brochure
12	3	Size: A4 | Pages: 8 | Imported 270 GSM\nAll Pages Varnish\nDesign Provided by: Client	500.00	75.74	37870.00	4	Brochure
13	3	Size: A4 | Pages: 8 | Imported 270 GSM\nAll Pages Varnish\nDesign Provided by: Client	1000.00	57.99	57990.00	5	Brochure
14	4	Size: 240mm width x 340 mm Height\nPages: 16\nPaper: Art Card 350 GSM\nCover Laminated\nDesign Provided by: Client	500.00	103.60	51800.00	0	Brochure
15	5	Pages: 16\nSize: A4\nPaper: 270 GSM Fine Paper \nAll Pages Varnish	100.00	409.80	40980.00	0	Company Profile Printing - Option 1
16	5	Pages: 16\nSize: A4\nPaper: 270 GSM Fine Paper \nAll Pages Varnish	300.00	190.93	57280.00	1	Company Profile Printing - Option 1
17	5	Pages: 16\nSize: A4\nPaper: Cover 270 GSM Fine Paper \nPaper: Inner 160 GSM Fine Paper \nAll Pages Varnish	100.00	366.90	36690.00	2	Company Profile Printing - Option 2
18	5	Pages: 16\nSize: A4\nPaper: Cover 270 GSM Fine Paper \nPaper: Inner 160 GSM Fine Paper \nAll Pages Varnish	300.00	161.23	48370.00	3	Company Profile Printing - Option 2
19	5	Pages: 16\nSize: A4\nPaper: 160 GSM Fine Paper \nAll Pages Varnish	100.00	352.60	35260.00	4	Company Profile Printing - Option 3
20	5	Pages: 16\nSize: A4\nPaper: 160 GSM Fine Paper \nAll Pages Varnish	300.00	152.67	45800.00	5	Company Profile Printing - Option 3
21	5	On Cover upto 20 sq. inch	1.00	4100.00	4100.00	6	Embossed UV
22	5	On Cover upto 40 sq. inch 	1.00	4500.00	4500.00	7	Golden Foiling
23	6	Size: A4\nPaper: Fine Paper (JR-RNDZ105)\nGSM: 105	300.00	51.67	15500.00	0	Envelope
24	7	Project: Hari Shrushti \nDesign and Printing\nPages: 28 \nClosed Size: 420x297 mm\nOpen Size: 840x297 mm\nCover Paper: Hardbound Cover with Matt Lamination and Golden Letters)\nInner Paper: 270+270= 540 GSM Fine Paper (SN-MBINS275)	4.00	11040.00	44160.00	0	Coffee Table
25	7	Project: Hari Shrushti \nDesign and Printing\nPages: 28 \nClosed Size: 420x297 mm\nOpen Size: 840x297 mm\nCover Paper: Hardbound Cover with Matt Lamination and Golden Letters)\nInner Paper: 270+270= 540 GSM Fine Paper (SN-MBINS275)	6.00	9250.00	55500.00	1	Coffee Table
26	8	Pages: 12\nSize: 9"x13"\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF, JPEG	1.00	24000.00	24000.00	0	Brochure Designing
27	8	Pages: 16\nSize: 9"x13"\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF, JPEG	1.00	32000.00	32000.00	1	Brochure Designing
28	8	Multiple Sizes\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF, JPEG	10.00	1770.00	17700.00	2	Wall Branding
29	9	Designing & Pasting\nSize : 8x11 Qty - 2\nPrachi sets Provide by Client	1.00	19564.00	19564.00	0	One Way Vision
30	10	Pages: 12\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF\n	1.00	24000.00	24000.00	0	Brochure Designing
31	10	Pages: 16\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF	1.00	28800.00	28800.00	1	Brochure Desiging
32	10	Pages: 20\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF	1.00	36000.00	36000.00	2	Brochure Designing
33	11	1 - Visiting Cards\n2 - Letterheads\n3 - Envelopes	3.00	1000.00	3000.00	0	Designing
34	11	Visiting Cards - Die Cut	500.00	4.13	2065.00	1	Visiting Card Printing
35	11	Visiting Cards - Die Cut	1000.00	2.92	2925.00	2	Visiting Card Printing
36	11	Paper: JRRUW-105 (Imported)	500.00	17.55	8775.00	3	Letterhead Printing - Imported Paper
37	11	Paper: JRRUW-105 (Imported)	1000.00	10.95	10950.00	4	Letterhead Printing - Imported Paper
38	11	Size: 9.5"x4.5"\nPaper: JRRUW-105 (Imported)	500.00	22.36	11180.00	5	Office Envelop Printing - Imported Paper
39	11	Size: 9.5"x4.5"\nPaper: JRRUW-105 (Imported)	1000.00	14.95	14950.00	6	Office Envelop Printing - Imported Paper
40	11	Paper: 100 GSM Alabaster	500.00	3.36	1680.00	7	Letterhead Printing - Standard Paper
41	11	Paper: 100 GSM Alabaster	1000.00	2.25	2248.00	8	Letterhead Printing - Standard Paper
42	11	Paper: 100 GSM Alabaster	500.00	4.34	2170.00	9	Office Envelop Printing - Standard Paper
43	11	Paper: 100 GSM Alabaster	1000.00	2.81	2814.00	10	Office Envelop Printing - Standard Paper
44	12	28 Pages Brochure Designing\nStandard design rate ₹2,000 per page. \nDiscounted rate ₹1,800 per page (Inclusive of 18% GST).	28.00	1800.00	50400.00	0	Designing
45	12	Size: 9"x13" | Pages: 28\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning\nStandard price ₹1,17,350/- \nDiscounted price ₹ 1,10,000/- (Inclusive of 18% GST).	500.00	220.00	110000.00	1	Brochure Printing
46	12	Size: 9"x13" | Pages: 28\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning\nStandard price ₹1,81,500/- \nDiscounted price ₹ 1,70,000/- (Inclusive of 18% GST).	1000.00	170.00	170000.00	2	Brochure Printing
47	13	Size: 9"x13" | Pages: 28\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning\nStandard price ₹ 1,73,500/-\nDiscounted price ₹ 1,60,400/- (Inclusive of 18% GST).	500.00	320.80	160400.00	0	Brochure Designing & Printing
48	13	Size: 9"x13" | Pages: 28\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning\nStandard price ₹ 2,37,500/-\nDiscounted price ₹ 2,20,400/- (Inclusive of 18% GST).	1000.00	220.40	220400.00	1	Brochure Designing & Printing
49	14	Re-Sizing and Printing	2.00	4041.50	8083.00	0	Hoarding 20x10 feet
50	14	\N	1.00	3127.00	3127.00	1	Hoarding 15x8 feet
51	15	Pages: 16\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing	16.00	2000.00	32000.00	0	Brochure Designing
52	15	Size: 9"x13" | Pages: 16\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	300.00	217.53	65260.00	1	Brochure Printing - 16 Pages (Option-1)
53	15	Size: 9"x13" | Pages: 16\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	500.00	171.32	85660.00	2	Brochure Printing - 16 Pages (Option-1)
54	15	Size: 9"x13" | Pages: 16\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	1000.00	137.90	137900.00	3	Brochure Printing - 16 Pages (Option-1)
55	15	Size: 9"x13" | Pages: 16\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	300.00	181.28	54385.00	4	Brochure Printing - 16 Pages (Option-2)
56	15	Size: 9"x13" | Pages: 16\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	500.00	138.68	69340.00	5	Brochure Printing - 16 Pages (Option-2)
57	15	Size: 9"x13" | Pages: 16\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	1000.00	107.97	107975.00	6	Brochure Printing - 16 Pages (Option-2)
58	16	Pages: 20\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing	20.00	2000.00	40000.00	0	Brochure Designing
59	16	Size: 9"x13" | Pages: 20\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	300.00	256.67	77000.00	1	Brochure Printing - 20 Pages (Option-1)
60	16	Size: 9"x13" | Pages: 20\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	500.00	206.00	103000.00	2	Brochure Printing - 20 Pages (Option-1)
61	16	Size: 9"x13" | Pages: 20\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning	1000.00	168.38	168375.00	3	Brochure Printing - 20 Pages (Option-1)
62	16	Size: 9"x13" | Pages: 20\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	300.00	223.33	67000.00	4	Brochure Printing - 20 Pages (Option-2)
63	16	Size: 9"x13" | Pages: 20\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	500.00	170.63	85315.00	5	Brochure Printing - 20 Pages (Option-2)
64	16	Size: 9"x13" | Pages: 20\nPaper cover page: 270 GSM (SN-MBINS270) Imported\nPaper inner pages: 160 GSM (SN-MBINS160) Imported\nAll Pages Varnish\nCentral pinning	1000.00	132.47	132475.00	6	Brochure Printing - 20 Pages (Option-2)
65	17	Package includes designing and printing of a 20-page brochure.\nDesigning: Deliverables – Open editable files (Adobe Illustrator), Print-ready PDF, and files for soft sharing.\n-----------\nPrinting: Size – 9" × 13", Pages – 20, Paper – 270 GSM (SN-MBINS270) Imported, All pages varnish, Central pinning.	500.00	287.20	143600.00	0	Brochure Designing and Printing Package
66	18	Size: 9"x13" | Pages: 20\nPaper: 270 GSM (SN-MBINS270) Imported\nAll Pages Varnish\nCentral pinning\nDesign: Provided by the client	500.00	206.00	103000.00	0	Brochure Printing
67	19	Paper: 100 GSM Alabaster	500.00	4.34	2170.00	0	Office Envelope 9.5"x4.5"
68	20	Paper: 100 GSM Alabaster\nPrice: 2,240/- \nDiscount: 500/-\n-------------\nFinal 1,740/-	200.00	8.70	1740.00	0	Letterhead Designing and Printing
69	20	Paper: 100 GSM Alabaster\nPrice: 2,530/- \nDiscount: 500/-\n-------------\nFinal 2,030/-	500.00	4.06	2030.00	1	Letterhead Designing and Printing (Recommended)
70	21	Size: A4\nPaper: 100 gsm Alabaster	500.00	4.62	2310.00	0	Letterhead Printing - Delivery 7 days
71	21	Size: A4\nPaper: 100 gsm Alabaster	500.00	5.82	2910.00	1	Letterhead Printing - Delivery Monday 30th March 2026
72	22	\N	1.00	1500.00	1500.00	0	Old Logo Receation (HD Vector Format) 
73	22	Visiting Card Design HARDWARE	1.00	1000.00	1000.00	1	\N
74	22	Visiting Card Design MARKETING 	1.00	1000.00	1000.00	2	\N
75	22	Main Board Design (Size 9x3 ft)	1.00	1500.00	1500.00	3	\N
76	23	Screen Printing One Color\nSize : Full scape\nProduct Code : T 	500.00	12.50	6250.00	0	Plastic Folder
77	24	i) Acrylic Marathi Sign Board\nii) Reception Glass Branding with Acrylic Letters, Warm Reverse LED Backlighting, Complete Fitting & Installation\niii) Acrylic Letters with Logo on Large Acrylic Panel, Company Name & Services Cutwork, Complete Fitting & Installation\niv) Hanuman Photo Frame with Acrylic LED Light Box	1.00	95000.00	95000.00	0	 Acrylic Board, Acrylic Letters & Reception Space Glass Work
78	25	• 3 logo options in one selected style\n• Finalise any one option\n• No additional concepts included\n• Only colour and font changes allowed (no concept changes)\n• Includes 2 revisions	1.00	3500.00	3500.00	0	Logo Designing - Standard
79	25	• 3 initial logo options\n• Option to combine two styles (e.g., Wordmark + Symbol, Combination Mark, etc.)\n• Additional concepts can be created based on feedback and references\n• Includes 3–4 revisions\n• Logo pricing mentioned in this quotation is tentative. The cost of logo design typically ranges between ₹8,500/- to ₹15,000/-. The final price will be confirmed after receiving your complete inputs, brief, and reference logos/images.	1.00	8500.00	8500.00	1	Logo Designing - Premium
80	26	2 Options	1.00	1000.00	1000.00	0	Visiting Card Design
81	26	\N	500.00	4.55	2275.00	1	Visiting Card Printing
82	26	\N	1000.00	3.20	3200.00	2	Visiting Card Printing
83	27	Cover design + approx. 40 inner pages layout	1.00	10200.00	10200.00	0	Handbook Design and DTP
84	27	Cover: Multi-colour\nInner pages: Black & White\nTotal pages: 160 (approx.)\n– 40 pages (different content)\n– 120 pages (single repeated design)	1000.00	53.70	53700.00	1	Handbook Printing
92	31	• 2 logo options in one selected style\n• Finalise any one option\n• No additional concepts included\n• Only colour and font changes allowed (no concept changes)\n• Includes 2 revisions	1.00	3500.00	3500.00	0	Logo Designing - Standard
93	31	• 3 initial logo options\n• Option to combine two styles (e.g., Wordmark + Symbol, Combination Mark, etc.)\n• Additional concepts can be created based on feedback and references\n• Includes 3–4 revisions\n• Logo pricing mentioned in this quotation is tentative. The cost of logo design typically ranges between ₹8,500/- to ₹15,000/-. The final price will be confirmed after receiving your complete inputs, brief, and reference logos/images.	1.00	8500.00	8500.00	1	Logo Designing - Premium
94	31	\N	1.00	1500.00	1500.00	2	Visiting Card & Letterhead Design
95	31	\N	500.00	4.55	2275.00	3	Visiting Card Printing 
96	31	\N	1000.00	3.20	3200.00	4	Visiting Card Printing
97	31	\N	500.00	3.36	1680.00	5	Letterhead Printing
98	31	\N	1000.00	2.25	2250.00	6	Letterhead Printing
113	33	Delivery Challan Book Specifications\nSize: A4\nPrinting: Mini Offset\nColours:\n• 1st Copy – 2 Colour\n• 2nd & 3rd Copy – Black\nPaper Quality:\n• 1st Copy – 70 GSM\n• 2nd & 3rd Copy – 58 GSM\nNumber of Pages: 50 Pages per Book	20.00	220.00	4400.00	0	Delivery Challan 1+2 
114	33		2.00	500.00	1000.00	1	Delivery Challan & Vcouher DTP
115	33	Voucher Pad Specifications\nSize: A5\nPrinting: Mini Offset\nColours: Black\nPaper Quality: 70 GSM\nNumber of Pages: 50 Pages per Pad	20.00	67.50	1350.00	2	Voucher Printing
116	30	Project Includes:\nProject Logo (Olive Residency)\nCompany Logo (Black Pearl)\nBrochure Design & Print (12 Pages – 500 Qty) Imported Paper\nProject Micro Site\nLetterhead (A4 Thick Paper)\nSite Wall Branding (Design Only)\nPackage Cost: ₹1,38,244/-\nDiscount: ₹13,444/-\nFinal Amount: ₹1,24,800/-	1.00	124800.00	124800.00	0	Real Estate Project Launch Kit - Option - 1
117	30	Project Includes:\nProject Logo (Olive Residency)\nCompany Logo (Black Pearl)\nBrochure Design & Print (12 Pages – 1000 Qty) Imported Paper\nProject Micro Site\nLetterhead (A4 Thick Paper)\nSite Wall Branding (Design Only)\nPackage Cost: ₹1,77,424/-\nDiscount: ₹17,724/-\nFinal Amount: ₹1,60,000/-	1.00	160000.00	160000.00	1	Real Estate Project Launch Kit - Option - 2
118	29	Project: Altamontt One\nPages: 12 (Faces)\nSize: 13"x9"\nPaper: Premium Fine Paper\nGSM: 270\nFinish: All Pages Varnish	200.00	206.47	41295.00	0	Brochure Printing - Imported Paper
119	29	Project: Altamontt One\nPages: 12 (Faces)\nSize: 13"x9"\nPaper: Premium Fine Paper\nGSM: 270\nFinish: All Pages Varnish	500.00	128.49	64245.00	1	Brochure Printing - Imported Paper
120	29	Project: Altamontt One\nPages: 12 (Faces)\nSize: 13"x9"\nPaper: Indian Art Card\nGSM: 300\nFinish: Cover Page Matt Laminated	200.00	134.55	26910.00	2	Brochure Printing - Indian Paper
121	29	Project: Altamontt One\nPages: 12 (Faces)\nSize: 13"x9"\nPaper: Indian Art Card\nGSM: 300\nFinish: Cover Page Matt Laminated	500.00	70.47	35235.00	3	Brochure Printing - Indian Paper
122	28	Project: Vitthal Dham\nPages: 16 (Faces)\nSize: 13"x9"\nPaper: Premium Fine Paper\nGSM: 270\nFinish: All Pages Varnish	1000.00	171.75	171755.00	0	Brochure Designing and Printing Package
123	32		1.00	16000.00	16000.00	0	Brochure Designing
124	32	Size: 9"×13" | Pages: 8\nPaper: 350 GSM Indian Art Card\nCover Page Matt or Gloss Laminated\nCentral pinning	100.00	169.00	16900.00	1	Brochure Printing
125	32	Size: 9"×13" | Pages: 8\nPaper: 350 GSM Indian Art Card\nCover Page Matt or Gloss Laminated\nCentral pinning	300.00	71.30	21390.00	2	Brochure Printing
126	32	Size: 9"×13" | Pages: 8\nPaper: 350 GSM Indian Art Card\nCover Page Matt or Gloss Laminated\nCentral pinning	500.00	51.80	25900.00	3	Brochure Printing
127	32		1.00	9999.00	9999.00	4	Project Micro Site - Essential for Digital Marketing
137	36	Check	1.00	500.00	500.00	0	Chalan - 1
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.quotations (id, quotation_id, date, client_id, tax_mode, show_tax_details, terms_and_conditions, signature_block, order_id, lead_id, created_by, created_at, subject, notes, discount_amount, discount_type, is_archived, manual_client_name, manual_client_address, manual_client_phone, manual_client_email, is_deleted, hide_totals) FROM stdin;
2	q_1771680582913	2026-02-21	17	exclusive	t	\N	t	\N	\N	\N	2026-02-21 04:00:00	\N	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
3	q_1771681774407	2026-02-21	\N	exclusive	t	\N	t	\N	\N	\N	2026-02-21 04:00:00	Planet Brookfield	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
4	q_1771990568455	2026-02-25	\N	exclusive	t	\N	t	\N	\N	\N	2026-02-25 04:00:00	Planet Brookfield	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
5	q_1772000287622	2026-02-25	250	exclusive	t	\N	t	\N	\N	\N	2026-02-25 04:00:00	Advik Company Profile	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
6	q_1772703990017	2026-03-05	250	exclusive	t	\N	t	\N	\N	\N	2026-03-05 04:00:00	Envelope A4 Size	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
7	q_1772704721082	2026-03-05	17	exclusive	t	\N	t	\N	\N	\N	2026-03-05 04:00:00	Coffee Table	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
8	q_1772708004010	2026-03-05	\N	exclusive	t	\N	t	\N	\N	\N	2026-03-05 04:00:00	Sky Elite	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
9	q_1772863290188	2026-03-07	127	exclusive	t	\N	t	\N	\N	\N	2026-03-07 04:00:00	One way Vision	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
10	q_1773226705861	2026-03-11	255	exclusive	t	\N	t	\N	\N	\N	2026-03-11 04:00:00	Brochure Designing	Note: Design for review will be shared with a watermark. Final files will be delivered after payment is completed.\nPayment Terms: 50% advance. Balance 50% after design approval and before delivery.	0.00	fixed	f	\N	\N	\N	\N	f	f
11	q_1773293958772	2026-03-12	248	exclusive	t	\N	t	\N	\N	\N	2026-03-12 04:00:00	Stationery	Imported paper stock cannot be guaranteed. At the time of final order, if the paper you selected is not available, we will inform you. We will also suggest an alternate paper and share its costing.	0.00	fixed	f	\N	\N	\N	\N	f	f
12	q_1773456495475	2026-03-14	115	exclusive	t	\N	t	\N	\N	\N	2026-03-14 04:00:00	Hari Shrushti Brochure Design and Print	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
13	q_1773457698491	2026-03-14	115	exclusive	t	\N	t	\N	\N	\N	2026-03-14 04:00:00	Hari Shrushti Brochure Designing & Printing	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
14	q_1773477495333	2026-03-14	137	exclusive	t	\N	t	\N	\N	\N	2026-03-14 04:00:00	Hoarding Re-Sizing and Printing	Note: GST is included in the above amount.\n	0.00	fixed	f	\N	\N	\N	\N	f	f
15	q_1773646778797	2026-03-16	\N	exclusive	t	\N	t	\N	\N	\N	2026-03-16 04:00:00	Brochure Designing and Printing - Majestic	Terms & Notes\nNote: Design for review will be shared with a watermark. Printing work will start after advance payment. Final files and printed material will be delivered after full payment is completed.\nPayment Terms: 50% advance. Balance 50% after design approval and before printing delivery.\n	0.00	fixed	f	\N	\N	\N	\N	f	f
16	q_1773648022798	2026-03-16	\N	exclusive	t	\N	t	\N	\N	\N	2026-03-16 04:00:00	Brochure Designing and Printing - Majestic	Terms & Notes\nTerms & Notes Note: Design for review will be shared with a watermark. Printing work will start after advance payment. Final files and\nprinted material will be delivered after full payment is completed. Payment Terms: 50% advance. Balance 50% after design approval and\nbefore printing delivery.	0.00	fixed	f	\N	\N	\N	\N	f	f
17	q_1773653295524	2026-03-16	267	exclusive	t	\N	t	\N	\N	\N	2026-03-16 04:00:00	Brochure Designing and Printing - Majestic	Note: Design preview will be shared with a watermark. Printing will start after advance payment. Final files and printed material will be delivered after full payment.\nPayment Terms: 50% advance. Balance 50% before delivery. \nTaxes: GST @18% Extra	0.00	fixed	f	\N	\N	\N	\N	f	f
18	q_1773732927161	2026-03-17	268	exclusive	t	\N	t	\N	\N	\N	2026-03-17 04:00:00	Brochure Printing	Payment Terms: 50% advance. Balance 50% before delivery. If payment is made by cheque, delivery will be done after the cheque is cleared.  |  Taxes: GST @18% extra.	0.00	fixed	f	\N	\N	\N	\N	f	f
19	q_1773745786696	2026-03-17	37	exclusive	t	\N	t	\N	\N	\N	2026-03-17 04:00:00	Office Envelope 9.5"x4.5"	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
20	q_1773745840139	2026-03-17	260	exclusive	t	\N	t	\N	\N	\N	2026-03-17 04:00:00	Letterhead Printing	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
21	q_1774514996480	2026-03-26	9	exclusive	t	\N	t	\N	\N	\N	2026-03-26 04:00:00	Letterhead Printing	If you confirm the order today before 6 PM, we can deliver it on Monday.	0.00	fixed	f	\N	\N	\N	\N	f	f
22	q_1774606389828	2026-03-27	270	exclusive	t	\N	t	\N	\N	\N	2026-03-27 04:00:00	Stationery & Main Board	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
23	q_1774679695745	2026-03-28	37	exclusive	t	\N	t	\N	\N	\N	2026-03-28 04:00:00	Plastic Folder	\N	0.00	fixed	f	\N	\N	\N	\N	f	f
24	q_1774694463831	2026-03-28	271	exclusive	t	\N	t	\N	\N	\N	2026-03-28 04:00:00	Acrylic Letters Board & Reception Space Glass Work	Price: Including GST | \nPayment Terms: ₹ 60,000/- advance with work order. ₹ 20,000/- before installation when material is delivered at site. Balance ₹ 15,000/- after completion of work.\n	0.00	fixed	f	\N	\N	\N	\N	f	f
25	q_1774866589138	2026-03-30	272	exclusive	t	\N	t	\N	\N	\N	2026-03-30 04:00:00	Logo and Visiting Card	Note: Design for review will be shared with a watermark. Final files will be delivered after payment is completed. Payment Terms: 50% advance. Balance 50% after design approval and before delivery.\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF\nTypes of Logos We Offer:\nWordmark, Lettermark, Emblem, Icon/Symbol, Combination Mark, Abstract Mark, and Minimal Logos.\nTo understand these logo types, please visit:\nhttps://shemoil.com/logotypes/	0.00	fixed	f	\N	\N	\N	\N	f	f
26	q_1774866968292	2026-03-30	272	exclusive	t	\N	t	\N	\N	\N	2026-03-30 04:00:00	Visiting Card Design and Printing	Note: Design for review will be shared with a watermark. Final files will be delivered after payment is completed. Payment Terms: 50% advance. Balance 50% after design approval and before delivery.\nDeliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF	0.00	fixed	f	\N	\N	\N	\N	f	f
27	q_1774940960210	2026-03-31	274	exclusive	t	\N	t	\N	\N	\N	2026-03-31 04:00:00	School Handbook Design and Printing	GST @ 18% Extra	0.00	fixed	f	\N	\N	\N	\N	f	f
31	q_1775022418374	2026-04-01	276	exclusive	t	\N	t	\N	\N	\N	2026-04-01 04:00:00	Logo Designing	Note: Design for review will be shared with a watermark. Final files will be delivered after payment is completed.\nPayment Terms: 50% advance. Balance 50% after design approval and before delivery. Deliverables: Open files (Adobe Illustrator), Print PDF, Soft sharing PDF Types of Logos We Offer: Wordmark, Lettermark, Emblem, Icon/Symbol, Combination Mark, Abstract Mark, and Minimal Logos. To understand these logo types, please visit:\nhttps://shemoil.com/logotypes/ | GST Extra	0.00	fixed	f	\N	\N	\N	\N	f	f
30	q_1775015596711	2026-03-31	275	exclusive	t		\N	\N	\N	\N	2026-04-01 04:00:00	Real Estate Project Launch Kit	GST Extra | Payment Terms: 50% Advance with formal work order and remaining 50% before delivery.	0.00	fixed	f	\N	\N	\N	\N	f	f
33	q_1775133660641	2026-03-31	279	exclusive	t		\N	\N	\N	\N	2026-04-02 04:00:00	Challan and Voucher	GST @ 18% Extra	0.00	fixed	f	\N	\N	\N	\N	f	f
29	q_1774963613597	2026-03-30	255	exclusive	t		\N	\N	\N	\N	2026-03-31 04:00:00	Brochure Printing	Price GST Inclusive | \nPayment Terms: 50% Advance with proper work order and remaining 50% before delivery. | The quotation is based on offset printing. Delivery time is 8–10 working days. Digital printing can be done in 3–4 days, but varnish will not be available, and the brochure size will be approx. 12" × 8.4".\n	0.00	fixed	f	\N	\N	\N	\N	f	f
28	q_1774950536136	2026-03-30	230	exclusive	t		\N	\N	\N	\N	2026-03-31 04:00:00	Brochure Designing and Printing	Price GST Inclusive | Payment Terms: 50% Advance with proper work order and remaining 50% before delivery. 	0.00	fixed	f	\N	\N	\N	\N	f	f
32	q_1775022834880	2026-03-31	277	exclusive	t		\N	\N	\N	\N	2026-04-01 04:00:00	Brochure Designing and Printing	Price GST @18% Included	0.00	fixed	f	\N	\N	\N	\N	f	f
36	QT-0033	2026-04-09	281	\N	f		\N	\N	\N	6	2026-04-09 22:56:08.105855	Challan		0.00	fixed	f	\N	\N	\N	\N	f	t
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.reminders (id, task_id, user_id, remind_at, is_dismissed, created_at) FROM stdin;
1	175	5	2026-04-10 18:37:00	f	2026-04-10 18:36:55.007228
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
1	manualOrderNumberEnabled	false	2026-04-04 21:22:26.316713
2	manualQuotationNumberEnabled	true	2026-04-04 21:22:26.316713
3	activityFeedOpen	false	2026-04-10 18:31:00.497872
\.


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.task_assignees (id, task_id, user_id) FROM stdin;
1	1	4
2	2	4
3	3	4
4	4	4
5	5	4
6	6	4
7	7	4
8	8	4
9	9	2
10	10	1
11	11	1
12	12	5
13	13	2
14	14	2
15	15	3
16	16	3
17	17	2
18	18	1
19	19	2
20	20	6
21	21	5
22	22	5
23	23	1
24	24	1
25	25	2
26	26	2
27	27	2
28	28	2
29	29	2
30	30	2
31	31	1
32	32	2
33	33	2
34	34	2
35	35	1
36	36	4
37	37	4
38	38	1
39	39	1
40	40	1
41	41	6
42	42	2
43	43	4
44	44	5
45	45	3
46	46	5
48	48	5
49	49	2
50	50	2
51	51	5
52	52	5
53	53	5
54	54	2
55	55	2
56	56	4
57	57	4
58	58	1
59	59	1
60	61	5
61	62	5
62	63	1
63	64	5
64	65	1
65	66	1
66	67	5
67	68	5
68	69	2
69	70	4
70	71	5
71	73	4
72	74	5
73	75	2
74	76	2
75	77	1
76	78	4
77	79	2
78	80	2
79	81	2
80	82	2
81	83	2
82	84	2
83	85	2
84	86	4
85	87	4
86	88	4
87	89	4
88	90	1
89	91	4
90	92	2
91	93	2
92	94	5
93	95	3
94	96	1
95	97	2
96	98	2
97	99	4
98	100	2
99	101	2
100	102	1
101	103	4
102	104	2
103	105	2
104	106	2
105	107	1
106	108	4
107	109	4
108	110	2
109	111	2
110	112	1
111	113	1
112	114	1
113	115	1
114	116	1
115	117	1
116	118	2
117	119	2
118	120	2
119	121	4
120	122	2
121	123	1
122	124	3
123	125	2
124	126	2
125	127	1
126	128	3
127	129	3
128	130	3
129	131	1
130	132	3
131	133	3
132	134	3
133	135	5
134	136	3
135	137	5
136	138	5
137	139	2
138	140	3
139	141	2
140	142	2
141	143	2
142	144	2
143	145	2
144	146	5
145	147	1
146	148	5
147	149	5
148	150	3
149	151	3
150	152	3
151	153	2
152	154	4
153	155	2
154	156	2
155	157	3
156	158	3
157	160	4
158	161	4
159	162	3
160	163	1
161	165	5
162	166	1
163	167	1
164	168	2
165	169	2
166	170	5
167	171	3
168	172	4
169	173	3
170	174	1
172	176	3
173	177	3
175	179	3
177	181	1
178	182	1
179	183	4
180	184	3
181	185	3
182	186	2
183	187	2
184	188	1
185	189	3
186	190	1
188	192	1
189	193	3
190	47	6
192	191	1
195	180	4
198	178	2
200	201	1
201	175	5
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.tasks (id, title, description, created_by, client_id, order_id, status, sort_order, created_at, due_date, is_important, is_archived, is_deleted) FROM stdin;
56	Mahesh Paper Bill - Check	\N	5	\N	\N	done	102	2026-03-09 05:52:16.204	2026-03-10	f	f	f
48	Darshan Singh Invoicing	UPI-DARSHAN PREMCHAND SI-XXXXXX1381@PTYES-UTIBXXXXXXX-XXXXXXXXX070-BROCHUREENVELOPE A Ref Num: XXXXXXXXXXXX4070	5	\N	\N	done	103	2026-03-08 08:50:28.257	\N	f	f	f
46	Hiten Mewani Quotation	\N	5	\N	\N	done	105	2026-03-07 20:18:53.71	2026-03-08	f	f	f
43	February Bank Statement Check	\N	5	\N	\N	done	107	2026-03-07 17:26:28.49	2026-03-09	f	f	f
42	Krishan Valley All PDF to mail Rushishi	Krishna Valley Avyukta, Anaya, Ananta Floor Plan PDF File Roosheesh ko Mail kardiya Hon One Drive ka Link Bheja hon 1 month expiry date ke sath	2	\N	\N	done	108	2026-03-07 08:02:37.623	\N	f	f	f
41	Errors in portal	\N	5	\N	\N	in_queue	109	2026-03-07 06:19:08.679	2026-03-07	f	f	f
24	Advik RRealty - Dummy Prepress	\N	1	\N	\N	done	26	2026-03-04 08:52:25.419	2026-03-04	f	f	f
23	Hari Shrushti - Dummy Prepress	Dummy yeh size me print hoga\nSize : 8.65 x 12.5 inch\nPaper Size : 20x13 inch	1	\N	\N	done	27	2026-03-04 05:28:46.443	2026-03-04	f	f	f
10	Darshan Singh Proforma	\N	5	\N	\N	done	29	2026-03-01 19:04:59.336	2026-03-02	f	f	f
18	Arjun Thesia - Payment Followup	\N	5	\N	\N	done	30	2026-03-02 11:35:08.723	2026-03-09	f	f	f
34	Binita Madam Quotation	8x11 Qty 2 One Way Vision Nikal Na Hai - Maruf Bahi Ne Pasting ka 2500 bola Hai - Baki appna quotation nikalna Hai	2	\N	\N	done	114	2026-03-05 06:49:44.917	2026-03-07	f	f	f
33	Life Space Builders LLP - Envelopes	Client se Address Poochna Hai Selection Vashi se Office par Mangwana hai / ya tu Direct Vashi selection se Ghatkopar dena Rahega ek bar Client se Confirm karne ke Baad	2	\N	\N	done	115	2026-03-05 06:33:08.953	2026-03-07	f	f	f
32	Prestige Graphic - Dummy Follow Up	Hari Shrushti & Advik RRealty Brochure Dummy Follow 	2	\N	\N	done	116	2026-03-05 06:29:01.811	\N	f	f	f
11	Sai Mannat - Invoicing	\N	5	\N	\N	waiting	33	2026-03-01 19:06:35.576	2026-03-07	f	f	f
29	Unique Avenue Mahesh Paper PO to be Make	\N	2	\N	\N	done	119	2026-03-05 04:58:05.177	\N	f	f	f
28	Unique Avenue Rajesh Printouch PO to be Make	\N	2	\N	\N	done	120	2026-03-05 04:57:11.29	\N	f	f	f
26	Deposite	\N	2	\N	\N	done	121	2026-03-05 04:52:48.129	\N	f	f	f
116	Sky Elite Brochure	\N	1	\N	\N	waiting	35	2026-03-17 05:14:52.463	\N	t	f	f
15	Advik RRealty Printing Proforma	Company Profile\nSize: A4\nQty: 300\nPage : 16\nPaper : 270 GSM Fine Paper\nVarnish : All Pages Gloss Varnish	1	\N	\N	done	27	2026-03-02 06:37:33.953	2026-03-02	f	f	f
21	Ertekaaz Photo Editing 😁😁	5806 - Gate Tower 2 > Main Shoot\n204 - Pixel 7	6	\N	\N	in_queue	124	2026-03-02 18:28:37.855	\N	f	f	f
20	Interakt Template Problem	\N	5	\N	\N	in_queue	125	2026-03-02 14:20:07.155	2026-03-09	f	f	f
17	Paper Calculation for dummy	Advik & Hari Shrushti Paper Calculation & Oder	2	\N	\N	done	126	2026-03-02 09:49:29.286	2026-03-04	f	f	f
45	Social Media 9 March	09.03.26 Brochure 4 fold	5	\N	\N	done	25	2026-03-07 18:50:42.839	2026-03-09	f	f	f
16	3 March Social Media Post - Coffee Table	\N	5	\N	\N	done	26	2026-03-02 07:34:31.38	2026-03-02	f	f	f
14	Checking - Bill No. Bill# 7541/2025-26 	\N	5	\N	\N	done	129	2026-03-02 06:02:42.123	2026-03-02	f	f	f
13	Invoice cross check	\N	5	\N	\N	done	130	2026-03-02 03:53:29.566	2026-03-02	f	f	f
9	اینویلپ تیار ہے واشی میں	\N	5	\N	\N	done	131	2026-03-01 19:00:25.858	2026-03-02	f	f	f
8	GRK Cheque Deposit	\N	5	\N	\N	done	132	2026-03-01 15:34:57.641	2026-03-02	f	f	f
7	GRK Cheque Deposit	\N	5	\N	\N	in_queue	133	2026-03-01 15:34:57.055	2026-03-02	f	f	f
6	GRK Cheque Deposit	\N	5	\N	\N	in_queue	134	2026-03-01 15:34:56.276	2026-03-02	f	f	f
5	GRK Cheque Deposit	\N	5	\N	\N	in_queue	135	2026-03-01 15:34:55.606	2026-03-02	f	f	f
4	GRK Cheque Deposit	\N	5	\N	\N	in_queue	136	2026-03-01 15:34:55.112	2026-03-02	f	f	f
3	GRK Cheque Deposit	\N	5	\N	\N	in_queue	137	2026-03-01 15:34:53.351	2026-03-02	f	f	f
2	GRK Cheque Deposit	\N	5	\N	\N	in_queue	138	2026-03-01 15:34:50.029	2026-03-02	f	f	f
1	GRK Cheque Deposit	\N	5	\N	\N	in_queue	139	2026-03-01 15:34:46.153	2026-03-02	f	f	f
36	Tax Invoice / Proforma Invoice Update	Sabhi jobs me Tax Invoice agar ban gaya hai to woh update karna hai,  aur agar Tax Invoice nahi bana hai to phir us me Proforma Invoice hona chahiye. Old jobs me bhi, matlab yeh ki koi bhi job khali nahi hona chahiye.	5	\N	\N	working	148	2026-03-06 11:16:02.416	2026-03-09	f	f	f
22	Ertekaaz Photo Editing 😁😁	5806 - Gate Tower 2 > Main Shoot\n204 - Pixel 7	6	\N	\N	in_queue	149	2026-03-02 18:30:53.073	\N	f	f	f
117	Ideal Residency - Hoarding  10x14 Feet	\N	1	\N	\N	done	10	2026-03-17 05:15:58.929	\N	f	f	f
37	Expenses Entry	\N	5	\N	\N	working	154	2026-03-07 04:27:08.397	2026-03-09	f	f	f
27	Bajaj School CBSC/SSC Planner	\N	2	\N	\N	done	155	2026-03-05 04:54:22.821	\N	f	f	f
25	Skyline Builders Floor Plan Working	Hanna Kashmiri Mail se Lerah Hon PDF File Hai	2	\N	\N	in_queue	156	2026-03-04 10:17:50.365	2026-04-01	f	f	f
40	Advik Envelope A4 Size	\N	1	\N	\N	done	21	2026-03-07 05:20:03.155	2026-03-07	f	f	f
49	GK Infra GST payment followup	\N	5	\N	\N	done	161	2026-03-08 08:51:31.972	2026-03-09	f	f	f
54	Marathi Board	\N	5	\N	\N	in_queue	164	2026-03-09 05:29:22.521	2026-03-23	f	f	f
12	Veendeep Website Data	\N	5	\N	\N	in_queue	165	2026-03-01 19:07:09.056	2026-03-23	f	f	f
39	Advik Envelope A4 Size	\N	1	\N	\N	done	22	2026-03-07 05:19:59.932	2026-03-07	f	f	f
50	MTPL2526-00312 - Cash deposit	₹ 8,750/- cash amount deposit karna hai HDFC me.	5	\N	\N	done	169	2026-03-08 10:29:18.942	2026-03-10	f	f	f
44	Planet Invoicing	25,390/- 3 job ka amount aaya hai. is ka bill banana hai. B2C me	5	\N	\N	in_queue	170	2026-03-07 18:44:55.852	2026-03-09	f	f	f
19	Old Office Electricity Bill Check	\N	5	\N	\N	done	171	2026-03-02 13:26:37.904	2026-03-18	f	f	f
38	Advik Envelope A4 Size	\N	1	\N	\N	done	23	2026-03-07 05:19:58.347	2026-03-07	f	f	f
51	Siddhi Group Payment Followup 	\N	5	\N	\N	in_queue	174	2026-03-08 10:50:00.244	2026-03-09	f	f	f
55	Shutter	\N	5	\N	\N	done	178	2026-03-09 05:29:39.498	2026-03-18	f	f	f
52	HDFC mobile number update	Saving NRO number update	5	\N	\N	in_queue	179	2026-03-08 11:26:20.274	2026-03-10	f	f	f
53	Product Catalogue - Image alt text	Example ALT texts:\n\nImage 1\n\nProduct Catalogue Design\n\nImage 2\n\nProfessional Product Catalogue Design\n\nImage 3\n\nProduct Catalogue Design Layout\n\nImage 4\n\nModern Product Catalogue Design	5	\N	\N	in_queue	187	2026-03-08 13:52:17.679	\N	f	f	f
35	Tajani Metal - Flyer Design	\N	1	\N	\N	done	24	2026-03-05 07:19:39.891	\N	f	f	f
31	Hari Shrushti - Coffee Table Corrections	\N	1	\N	\N	done	25	2026-03-05 05:14:47.944	\N	f	f	f
66	Vasant Leela Flex	\N	1	\N	\N	done	18	2026-03-09 09:51:28.062	\N	f	f	f
111	Sona paper - Balaji Heights paper follow up	\N	2	\N	\N	done	68	2026-03-17 04:47:12.689	2026-03-17	f	f	f
109	Bank Statement	\N	5	\N	\N	done	69	2026-03-17 04:13:53.641	2026-03-17	f	f	f
108	Jagruti Printing Press Bill entry	Bill no. 1447/25-26	4	\N	\N	done	70	2026-03-17 03:49:28.267	2026-03-17	f	f	f
65	Gardenia Flex	\N	1	\N	\N	done	19	2026-03-09 09:51:02.581	\N	f	f	f
106	Balaji Heights insertion Plan Print Out	\N	2	\N	\N	done	72	2026-03-16 07:04:59.615	\N	f	f	f
104	Supermax Boiler Engineers LH	\N	2	\N	\N	done	73	2026-03-16 05:57:54.159	2026-03-17	f	f	f
58	Drillboss Infra Projects - Stationery Design	\N	1	\N	\N	done	20	2026-03-09 07:08:24.963	2026-03-09	f	f	f
100	Dr Faris Letter Head A4 Printing	\N	2	\N	\N	done	76	2026-03-14 05:51:57.045	\N	f	f	f
59	Chowdhary Construction Work - Stationery Design	\N	1	\N	\N	done	32	2026-03-09 07:09:36.931	\N	f	f	f
91	7,000/- cash record to Invoice No. MTPL2526-00312	Invoice No. MTPL2526-00312 me yeh amount received dikhana hai. ₹ 1,750/-balance rahega, phir jab cash aayega to woh deposit kar ke close kareinge is invoice ko	5	\N	\N	done	80	2026-03-12 07:00:03.072	2026-03-14	f	f	f
77	Skyline Prime - Brochure Design	\N	1	\N	\N	waiting	34	2026-03-11 08:45:34.882	\N	f	f	f
89	3 Selection Bills Entry	\N	4	\N	\N	done	82	2026-03-12 06:31:22.852	2026-03-12	f	f	f
88	3 Selection Bills Entry	\N	4	\N	\N	done	83	2026-03-12 06:31:13.733	2026-03-12	f	f	f
87	Cash Payment Deposit	\N	4	\N	\N	done	84	2026-03-12 06:12:29.532	2026-03-12	f	f	f
84	Selection Se Pending Invocie Mangwa na Hai	\N	2	\N	\N	done	86	2026-03-12 05:46:08.449	\N	f	f	f
82	Shameem Bhai - Deposite	\N	2	\N	\N	done	87	2026-03-12 05:28:16.873	\N	f	f	f
81	Shameem Bhai - Deposite	\N	2	\N	\N	done	88	2026-03-12 05:28:11.249	\N	t	f	f
80	Life Space Group Cheque	\N	2	\N	\N	done	89	2026-03-12 05:15:03.249	\N	f	f	f
78	Life Space Builders LLP Cheque deposit	\N	4	\N	\N	done	90	2026-03-12 03:34:03.949	2026-03-12	f	f	f
76	Fahad Khan - Shelter Images Data	Shelter Builder Project ka Images dena Hai	2	\N	\N	done	91	2026-03-11 04:47:50.77	\N	f	f	f
72	VR Builders - Company Profile Follow-up for Design Finalization 	\N	1	\N	\N	done	92	2026-03-10 10:17:20.214	2026-03-25	f	f	f
70	Invoicing for job 20260129-122	Original Price: ₹52,995.76 \nDiscount: − ₹3,000.00 \nTaxable Amount: ₹49,995.76 \nGST 18%: ₹8,999.24\nGrand Total: ₹58,995\n	5	\N	\N	done	93	2026-03-09 12:56:20.992	2026-03-10	f	f	f
68	Laxmi Group Social Media	\N	5	\N	\N	in_queue	94	2026-03-09 10:14:54.031	2026-03-09	f	f	f
67	Laxmi Group Social Media	\N	5	\N	\N	done	95	2026-03-09 10:14:51.902	2026-03-09	f	f	f
63	Payment Followup	Sheet me jitna bhi blue colour marked hai sab ko followup karna hai	5	\N	\N	waiting	39	2026-03-09 07:41:51.884	2026-03-09	f	f	f
113	Hari Shrushti Wall Branding	\N	1	\N	\N	in_queue	38	2026-03-17 05:13:07.485	\N	f	f	f
64	DP COnstruction Email Renewal	\N	5	\N	\N	done	98	2026-03-09 08:07:43.626	2026-03-13	f	f	f
61	DP Construction Email Expiry	Email Services\nwww.dpconstructions.co.in\nEmail Renewal\nExpiry Date: 13/03/2026\n-----\nMTPLPI-000387	5	\N	\N	done	99	2026-03-09 07:19:38.874	2026-03-09	f	f	f
60	Payment followups	\N	5	\N	\N	in_queue	100	2026-03-09 07:10:37.728	2026-03-09	f	f	f
107	Skyline Contractors Company Profile Corrections 	\N	1	\N	\N	done	14	2026-03-16 07:09:30.056	2026-03-16	f	f	f
94	Altmont quotation	\N	5	\N	\N	done	142	2026-03-13 01:03:18.807	2026-03-13	f	f	f
93	Balaji Heights Appoval	\N	5	\N	\N	in_queue	143	2026-03-12 16:57:37.114	2026-03-30	f	f	f
92	Abri Crystal - Printouts	\N	5	\N	\N	done	144	2026-03-12 13:56:52.961	2026-03-17	f	f	f
79	Shelter Developers Letterhead	\N	5	\N	\N	done	145	2026-03-12 05:04:49.029	2026-03-12	f	f	f
73	Invoice and Payment	\N	5	\N	\N	done	146	2026-03-10 16:29:54.191	2026-03-11	f	f	f
57	Sona Bill Number Bill# MUGST25/3009977	Sona Bill Number Bill# MUGST25/3009977 yeh bill jo aap ne entry kiya hai woh aur jo upload kiya hai woh dono match nahi ho raha hai, aur hamesha Sona se PDF bill ka email mangwa lijiye, aur PDF bill hi ipload kijiye, scan wala nahi. Mai ne bill approve nahi kiya hai	5	\N	\N	done	147	2026-03-09 06:57:14.432	2026-03-10	f	f	f
114	Sai Enterprises Industrial Logo - Modification 	\N	1	\N	\N	done	12	2026-03-17 05:14:03.35	\N	f	f	f
75	Abri Crystal Floor Plan Correction	Floor Plan MainCloum Remove karna Hai aur Car Parking mein Number Likhna Hai	2	\N	\N	done	152	2026-03-11 04:47:03.89	2026-03-23	f	f	f
62	Mango Basket - Domain	MANGOBASKETKONKAN.COM before it expires on 17/03/2026.	5	\N	\N	done	153	2026-03-09 07:19:56.499	2026-03-17	f	f	f
74	Abri Crystal - Brochure	\N	5	\N	\N	done	158	2026-03-10 17:03:22.241	2026-03-23	f	f	f
69	TAX Notice	PTRC tax payment ka notce aaya hai, CA se baat karna hai aur us ka kya karna hai poochna hai.	5	\N	\N	in_queue	159	2026-03-09 12:39:10.491	2026-03-20	f	f	f
95	All invoices need to be updated in Jobs	Invoices numbers : \n317\n319\n320	3	\N	\N	done	24	2026-03-13 07:11:16.85	2026-03-13	f	f	f
112	Tajani Metal - Flyer Corrections	\N	1	\N	\N	done	13	2026-03-17 05:11:22.683	\N	f	f	f
98	SKY ELITE Floor Plan	\N	2	\N	\N	working	168	2026-03-13 11:10:08.504	2026-04-01	f	f	f
102	Nirmaan Aishwaryam - Marathi Flex Design 10x10 Feet	\N	1	\N	\N	done	15	2026-03-14 09:00:52.575	2026-03-14	f	f	f
85	Bafan Se Bill Mangwana Hai	\N	2	\N	\N	done	177	2026-03-12 05:47:00.416	\N	f	f	f
110	Balaji Heights Brochure follow up	\N	2	\N	\N	done	181	2026-03-17 04:40:25.101	2026-03-27	f	f	f
105	Shelter Builder LH Correction	\N	2	\N	\N	done	182	2026-03-16 06:00:01.184	2026-03-23	f	f	f
83	HD Builder Paper Bag Follow	\N	2	\N	\N	done	183	2026-03-12 05:39:28.641	\N	f	f	f
71	SUCCESS	https://x.com/mindsetmachine/status/2031091882714083797?s=20	5	\N	\N	in_queue	184	2026-03-10 08:30:20.573	\N	f	f	f
101	Shrushri Coffee table Book Paper for Prepress	\N	2	\N	\N	done	186	2026-03-14 05:53:00.557	2026-03-23	f	f	f
97	Vasant Leela Flex	\N	2	\N	\N	done	190	2026-03-13 11:06:47.945	\N	f	f	f
96	Hari Shrushti - Coffee Table - Preparing for printing (Pre-Press)	\N	1	\N	\N	done	16	2026-03-13 09:33:21.229	2026-03-13	f	f	f
90	Hari Shrushti - Brochure Correction	\N	1	\N	\N	done	17	2026-03-12 06:58:04.143	\N	f	f	f
123	Aamrit Logo Payment Followup	₹ 7,500/- 	1	\N	\N	in_queue	37	2026-03-18 06:34:20.014	\N	f	f	f
157	1) Shree Yash hardware job create. 2) Prapti Associates job create.	\N	3	\N	\N	done	11	2026-03-27 10:46:02.152	\N	f	f	f
152	Shelter Builder Letterhead packing 	\N	3	\N	\N	done	12	2026-03-25 12:19:16.528	\N	f	f	f
170	MSEDCL Bill Payment	2560\n4 April last date	5	\N	\N	in_queue	24	2026-03-30 05:02:09.572	2026-04-04	f	f	f
169	Deeplaxmi Associate - LH & Env	\N	2	\N	\N	done	25	2026-03-30 04:44:53.481	\N	f	f	f
168	Shelter Plastic Folder	\N	2	\N	\N	in_queue	26	2026-03-30 04:26:58.707	2026-04-01	f	f	f
164	Slary aur profit sharing record	\N	5	\N	\N	in_queue	28	2026-03-29 05:37:36.671	\N	f	f	f
166	Abri Floor Plan Booklet Quality Check	\N	5	\N	\N	done	40	2026-03-29 08:29:46.444	2026-03-30	f	f	f
151	Altamontt realty letterhead packing ki.	\N	3	\N	\N	done	13	2026-03-25 12:17:15.344	\N	f	f	f
160	Salaries details to be send to CA	\N	5	\N	\N	done	32	2026-03-28 03:09:30.39	2026-03-28	f	f	f
159	Bank Statement	Cross check and bank statement and record the transactions if any left.	5	\N	\N	in_queue	33	2026-03-28 03:07:43.7	\N	f	f	f
150	3 jobs ka status update ki	\N	3	\N	\N	done	14	2026-03-25 12:15:15.815	\N	f	f	f
134	Create proforma for Job ID 20260317-183	\N	5	\N	\N	in_queue	16	2026-03-20 18:51:50.001	2026-03-23	f	f	f
153	Shelter Builder Envelopes & Letter Head to Delivery	\N	2	\N	\N	done	36	2026-03-26 05:32:39.417	2026-03-26	f	f	f
133	Aqua Vista Buildcon LLP	New job create karna hai. \nLogo and \nLetterhead design	5	\N	\N	done	18	2026-03-20 15:57:40.205	2026-03-23	f	f	f
136	20260314-178 - Create Proforma Invoice	20260314-178 is ka proforma banana hai lekin client ko abhi bhejna nahi hai. Client ko sirf amount batana hai, nahi to client bolega mujhe GST ka bill nahi chahiye aur GST ka amount pay nahi karega.	5	\N	\N	in_queue	17	2026-03-20 19:11:05.878	2026-03-23	f	f	f
132	SKA - Gudi Padwa Post - Proforma	JOB Create Karna Hai\nJob Name : SKA - Gudi Padwa Post\nJob Type : Social Media Post\nCompany : Swapnil Kalyankar Architects\nStatus : Completed	5	\N	\N	done	19	2026-03-20 15:54:19.023	2026-03-23	f	f	f
149	Credit Card Axis - 19,660/- 	\N	5	\N	\N	done	40	2026-03-25 09:58:44.777	2026-04-02	f	f	f
148	Credit Card HDFC - 13,241/-	\N	5	\N	\N	done	41	2026-03-25 09:56:32.532	2026-03-28	f	f	f
146	Zoho Subscription	\N	5	\N	\N	done	43	2026-03-25 08:49:32.582	\N	f	f	f
143	Crescent Clinic Letter Head Delivery Taloja	\N	2	\N	\N	done	44	2026-03-23 13:33:35.573	\N	f	f	f
142	Hari Shrushti Coffee Table Book- EP Sticker Pasting	\N	2	\N	\N	done	45	2026-03-23 13:33:02.485	2026-03-24	f	f	f
130	Crescent Clinic Letter Head Packing	\N	3	\N	\N	done	20	2026-03-19 10:25:00.393	2026-03-19	f	f	f
139	Office Outer Camera 	Office outer camera band hai, us ko chalu karna hai	5	\N	\N	in_queue	47	2026-03-23 03:11:22.615	2026-04-01	f	f	f
138	shemoil.com	\N	5	\N	\N	in_queue	48	2026-03-20 19:39:39.163	2026-03-21	f	f	f
137	Social Media	\N	5	\N	\N	in_queue	49	2026-03-20 19:19:30.265	2026-03-23	f	f	f
129	Supermax Boiler Engineers Packing	@	3	\N	\N	done	21	2026-03-19 10:23:16.849	2026-03-19	f	f	f
135	satyambuilders.co domain and hosting renewal	Domain and hosting for 1 year \n₹ 8,496/- including GST	5	\N	\N	done	51	2026-03-20 18:59:19.008	2026-03-21	f	f	f
128	Abri Realty Letter Head Packing	\N	3	\N	\N	done	22	2026-03-19 10:21:31.073	2026-03-19	f	f	f
124	1) "ALTAMONTT REALTY LLB" Stationary Job create done.  2) SHELTER BUILDERS & DEVELOPERS  Envelopes & Plastic Folders job create done.	\N	3	\N	\N	done	23	2026-03-18 09:00:04.269	\N	f	f	f
176	Dua Builders & Developers ka job creat karna hai  	\N	3	\N	\N	done	6	2026-03-31 05:26:51.145	\N	f	f	f
173	DenEb Air Gases job create done	\N	3	\N	\N	done	7	2026-03-30 10:32:22.829	\N	f	f	f
171	Deep Laxmi letterhead pack karna hai.	\N	3	\N	\N	done	8	2026-03-30 05:34:57.063	\N	f	f	f
162	Proforma update karna hai	\N	3	\N	\N	done	9	2026-03-28 06:01:11.399	\N	f	f	f
126	Vashi Selection 3 Job ready hai	\N	2	\N	\N	done	59	2026-03-19 04:06:39.981	2026-03-19	f	f	f
125	Altamontt Realty LLP Stationery ready to print 	\N	2	\N	\N	done	60	2026-03-18 11:34:30.144	2026-03-19	f	f	f
158	Shree Yash Hardware ka  portal  me Quotation banai.	\N	3	\N	\N	done	10	2026-03-27 10:48:50.58	\N	f	f	f
121	Bills Entry	2 Bills Rajesh Printouch: 7903/2025-26, 7907/2025-26\n1 Bill Sonafine: MUGST25/3010355	4	\N	\N	done	62	2026-03-18 04:18:12.551	2026-03-18	f	f	f
119	abri Realty Letter Head Sent to Printing	\N	2	\N	\N	done	63	2026-03-17 08:03:01.44	\N	f	f	f
174	Altamontt One - Brochure Correction	\N	1	\N	\N	done	6	2026-03-30 11:52:22.508	\N	t	f	f
154	Bank Statement	\N	5	\N	\N	done	141	2026-03-26 18:53:01.894	2026-03-28	f	f	f
163	Abri Crystal Floor Plan Booklet	\N	1	\N	\N	done	7	2026-03-28 10:23:16.677	\N	t	f	f
127	SKA - Gudi Padwa Social Media Post	\N	1	\N	\N	done	9	2026-03-19 07:50:34.062	\N	f	f	f
145	PVC desktop display 	A4 size qty 3\nA5 size qty 3\n	2	\N	\N	in_queue	172	2026-03-24 14:17:53.244	2026-04-02	f	f	f
122	Shelter Builder Plastic Folder Quotation 	\N	2	\N	\N	in_queue	175	2026-03-18 04:27:34.248	2026-04-01	f	f	f
167	Balaji Floor Plan Correction 	\N	5	\N	\N	done	28	2026-03-29 19:06:35.709	2026-03-30	t	f	f
141	Altamontt Realty - Receipt Binding	\N	2	\N	\N	done	185	2026-03-23 07:47:52.136	2026-03-27	f	f	f
156	Prapti Associate - Letter Head Correction & Proofing	\N	2	\N	\N	done	188	2026-03-27 09:45:05.708	\N	f	f	f
155	CA Praveen Chandak Office - Salary Details Required	\N	2	\N	\N	done	189	2026-03-27 09:05:40.752	\N	f	f	f
144	Sachin Kadam Jayashree Promoters And Developers	\N	2	\N	\N	in_queue	191	2026-03-24 10:38:06.069	2026-04-02	f	f	f
120	Sunrise Global School - Hand Book Quotation	\N	2	\N	\N	in_queue	192	2026-03-17 10:41:38.906	2026-04-01	f	f	f
118	20260317-182 -Shreeji Developer Sale Display	20260317-182 -Shreeji Developer Sale Display - Z Plus - New Elevation ka photo add karna Hai 	2	\N	\N	working	193	2026-03-17 06:06:20.544	2026-03-02	f	f	f
131	Shelter Builders Eid Mubarak	\N	1	\N	\N	done	31	2026-03-20 07:17:19.051	\N	f	f	f
140	Altamont Brochure job creation	\N	5	\N	\N	done	15	2026-03-23 05:54:21.095	2026-03-23	f	f	f
165	Salary and Profit sharing	\N	5	\N	\N	in_queue	27	2026-03-29 05:40:27.001	2026-03-30	f	f	f
115	Sky Elite - Wall Branding Urgent	\N	1	\N	\N	done	11	2026-03-17 05:14:45.047	\N	f	f	f
184	Marvel Travel job create done	\N	3	\N	\N	done	3	2026-04-01 05:25:33.316	\N	f	f	f
201	Task Testing	This is the detail about this task	6	236	4	working	36	2026-04-07 01:33:52.341152	\N	f	f	f
175	Rushish Timbadia Floor Plan Bill		5	237	6	waiting	19	2026-03-31 05:12:53.363	2026-04-01	f	f	f
179	Dua Builders & Developers ka data upload karna hai	\N	3	\N	\N	done	4	2026-03-31 06:23:35.137	\N	f	f	f
177	school book k pages scan karna hai	\N	3	\N	\N	done	5	2026-03-31 05:27:45.497	\N	f	f	f
192	Marvel Travels ID card correction	\N	1	\N	\N	done	0	2026-04-03 06:23:11.225	\N	f	f	f
186	Altamontt One - Brochure Dummy to be from Prestige Graphic	\N	2	\N	\N	done	8	2026-04-01 06:59:24.029	2026-04-02	f	f	f
183	Bills Entry	Akshay Enterprises: Bill No. 168/26, Bill No. 207/26	4	\N	\N	done	11	2026-04-01 03:48:25.154	2026-04-01	f	f	f
180	Cheque Deposit - Morajkar	\N	5	\N	\N	done	14	2026-03-31 07:04:12.246	2026-04-06	f	f	f
178	The Prop Kingdom - Shop Sign Board & Sun board Quotation	\N	2	\N	\N	done	16	2026-03-31 06:03:57.433	\N	f	f	f
103	Sonafine Bill Entry	Bill No. MUGST25/3010293	4	\N	\N	done	74	2026-03-16 03:33:50.302	2026-03-16	f	f	f
99	Bafna Cards pending Bills entries	11-12-24      44664         6,018/-\n17-12-24     44736          3,009/-\n04-01-24     44926        4,047/-\n13-01-25       45007        1,534/-\n11-03-25       45660        1,003/-\n17-03-25        45698       1,522/-\n22-03-25        45771        767/-	4	\N	\N	done	77	2026-03-14 04:13:23.263	2026-03-14	f	f	f
86	Bafna Cards Outstanding Checking	Bafna walon ne outstanding bheja hai, sab bill check kiya, neeche diye huye kuch bills ki entry nhi hai:\nDate/Bill No./ Amount\n11-12-24      44664         6,018/-\n17-12-24     44736          3,009/-\n04-01-24     44926        4,047/-\n13-01-25       45007        1,534/-\n11-03-25       45660        1,003/-\n17-03-25        45698       1,522/-\n22-03-25        45771        767/-	4	\N	\N	done	85	2026-03-12 05:50:24.557	2026-03-12	f	f	f
47	Portal Development	1 - Pura Quotation duplicate option chahiye\n2 - Quotation ke andar suppose ek item daal diye, woh pura item duplicate ka option chahiye\n3 - Client me GST certificate upload karne ka option chahiye	5	\N	\N	in_queue	104	2026-03-07 20:27:27.523	2026-03-22	f	f	f
30	abdul Mabood Book Transport Amount Confirm	abdul Mabood Book Transport Amount Confirm from Abdul Rauf\nper Box 80 Book chammne Islam per Box Packing & Forwarding 150/- Transport charge malum nahi hai woh Jage par malum padta Hai - ye sabhi baat Shameem Bhai ko Bata Diya Hon	2	\N	\N	done	118	2026-03-05 05:01:13.12	\N	f	f	f
187	Vitthaldham Floor Plan	\N	2	\N	\N	working	7	2026-04-01 13:24:17.661	2026-04-02	f	f	t
191	Matheran River Valley - Brochure Wireframe	\N	1	\N	\N	done	1	2026-04-02 13:17:48.219	\N	t	f	f
190	Shree Yash Hardware & Marketing Board Design 	\N	1	\N	\N	done	2	2026-04-02 11:40:25.588	2026-04-02	f	f	f
188	Marvel Travels - ID Card Design	\N	1	\N	\N	done	3	2026-04-01 14:03:06.001	\N	f	f	f
182	Altamont One – Prepare brochure dummy file and quality check final file for client email.	\N	1	\N	\N	done	4	2026-03-31 12:55:06.506	2026-03-31	f	f	f
181	Shree Yash Hardware - VC	\N	1	\N	\N	done	5	2026-03-31 07:13:02.267	2026-03-31	f	f	f
147	Sky Elite - Wall Branding Corrections	1. Change the logo of sky city, I will provide the final one in a bit\n2. A project by Rituraj Developers, Rituraj Developers ina part of sky city group\n3. Project has 1,2,3 BHKs\n4. Image on the third panel needs to be changed, it seems like it's on fire and the image is blending too well with the background\n5. We are not providing library officially hence change that panel for patio, party lawn or some other amenity\n6. Elevations thode se pop hoke aaye vaisa kuchh karna hai, brighten it up maybe	1	\N	\N	done	8	2026-03-25 09:43:19.184	2026-03-25	f	f	f
172	Bills Entry	Selection: Bill No. 19824, 19508, 19913	4	\N	\N	done	22	2026-03-30 05:40:18.109	2026-03-30	f	f	f
161	Bills Entry	Prestige Prints: Invoice No. 311\nRajesh Printouch: Invoice No. 8244/2025-26\nSonafine: Invoice No. MUGST25/3010590\nSelection: Invoice No. 19661, 19637, 19521, 19388, 19311\nBafna Cards: Invoice No. 49575	4	\N	\N	done	31	2026-03-28 04:39:45.65	2026-03-28	f	f	f
193	 Social Media Post Share on Face Book, Instagram , Google my Business	\N	3	\N	\N	done	0	2026-04-03 07:19:23.897	\N	f	f	f
189	Matheran River Valley job create karna hai & link update.	\N	3	\N	\N	done	1	2026-04-02 05:24:53.126	\N	f	f	f
185	Prapti Associates letterhead pack karna hai	\N	3	\N	\N	done	2	2026-04-01 05:51:43.14	\N	f	f	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ertekaaz
--

COPY public.users (id, username, name, password, role, created_at) FROM stdin;
5	iamtheboss	Nizam	$2b$10$H520jRpjwk2XmqlOy.KkROA1.v/J2Rs5462c6GzmrpDEhQCC6xoCa	admin	2026-04-04 14:52:21.112778
6	whattt.noway	Shemoil	$2b$10$m9BmuaOkY0Bc/PYSDhCEPeiaYz.zrikuG/BU9KOIX5U.tDsBFR1FS	superadmin	2026-04-04 14:52:21.112778
1	qamar@shemoil.in	Qamar	$2b$10$t0uQZ1ssnBk4tgMyPmpqRe1r1TDjcZoIP0uerb4X.jJEPUx32y8cy	executive	2026-04-04 14:52:21.112778
2	kamal@shemoil.in	Kamal	$2b$10$t0uQZ1ssnBk4tgMyPmpqRe1r1TDjcZoIP0uerb4X.jJEPUx32y8cy	executive	2026-04-04 14:52:21.112778
3	shahjahan	Shahjahan	$2b$10$t0uQZ1ssnBk4tgMyPmpqRe1r1TDjcZoIP0uerb4X.jJEPUx32y8cy	executive	2026-04-04 14:52:21.112778
4	shameem	Shameem	$2b$10$t0uQZ1ssnBk4tgMyPmpqRe1r1TDjcZoIP0uerb4X.jJEPUx32y8cy	executive	2026-04-04 14:52:21.112778
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 91, true);


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.clients_id_seq', 281, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.comments_id_seq', 544, true);


--
-- Name: lead_quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.lead_quotations_id_seq', 1, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.leads_id_seq', 7, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: order_assignees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.order_assignees_id_seq', 17, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.orders_id_seq', 128, true);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 137, true);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.quotations_id_seq', 36, true);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.reminders_id_seq', 1, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.settings_id_seq', 8, true);


--
-- Name: task_assignees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.task_assignees_id_seq', 201, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.tasks_id_seq', 201, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ertekaaz
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


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

\unrestrict G9jESaX6dDEjI3bnYjgtloGPDUoXg6FbPe2gr3ul812EB9y5PRs8rljQcMbzGTb

