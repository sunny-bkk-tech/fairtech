--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

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
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: sunny
--

CREATE TABLE public.exchange_rates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    rate numeric(20,8) NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.exchange_rates OWNER TO sunny;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: sunny
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    from_currency text,
    to_currency text,
    amount numeric(20,8) NOT NULL,
    converted_amount numeric(20,8),
    exchange_rate numeric(20,8),
    fee numeric(20,8) DEFAULT '0'::numeric,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    description text,
    vendor_id character varying,
    stripe_payment_intent_id text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO sunny;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sunny
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    passport_number text NOT NULL,
    phone_number text NOT NULL,
    nationality text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    is_verified boolean DEFAULT false,
    stripe_customer_id text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO sunny;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: sunny
--

CREATE TABLE public.vendors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    business_name text NOT NULL,
    business_address text NOT NULL,
    business_type text NOT NULL,
    business_license text,
    tax_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    is_verified boolean DEFAULT false,
    approved_by character varying,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO sunny;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: sunny
--

CREATE TABLE public.wallets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    currency text NOT NULL,
    balance numeric(20,8) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.wallets OWNER TO sunny;

--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: sunny
--

COPY public.exchange_rates (id, from_currency, to_currency, rate, updated_at) FROM stdin;
11678259-0459-463e-9ebe-23a00a02dd0a	EUR	USD	1.18000000	2025-07-26 23:50:43.718
1aacd649-8628-4377-a224-1076d3985e4d	USD	LAK	21000.00000000	2025-07-26 23:50:43.718
3d30b0d5-544b-4382-8c69-a374de9edf46	THB	USD	0.02900000	2025-07-26 23:50:43.718
412b3dfa-e7f2-410e-8531-d113f7612e78	USD	THB	34.50000000	2025-07-26 23:50:43.718
4e0fcce9-6068-4860-8e5a-bbc11d8a82b9	EUR	LAK	24700.00000000	2025-07-26 23:50:43.718
68cff3a2-f1a0-4d42-80c7-cc05530a5ec6	LAK	USD	0.00004800	2025-07-26 23:50:43.718
c7861e17-f2dd-4cff-b229-bc4d9c3b0aed	USD	EUR	0.85000000	2025-07-26 23:50:43.718
ed88a47b-133f-49a0-959f-ba3bc4859ddf	THB	LAK	610.00000000	2025-07-26 23:50:43.718
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: sunny
--

COPY public.transactions (id, user_id, from_currency, to_currency, amount, converted_amount, exchange_rate, fee, type, status, description, vendor_id, stripe_payment_intent_id, created_at) FROM stdin;
09891ed7-54be-489d-b585-b3d176a2f4a8	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	USD	LAK	100.00000000	2100000.00000000	21000.00000000	0.50000000	exchange	completed	Exchange USD to LAK	\N	\N	2025-07-27 08:55:20.719
574e9640-d5a1-496a-b9ef-4a8674b382f7	85bed410-9b55-4cf8-9774-70b85059126f	USD	USD	257.55000000	\N	\N	0.00000000	topup	completed	Top up USD wallet	\N	pi_3RpWR7F7DfJ06Q5Y0q6DNKQw	2025-07-27 08:24:55.813
df1fc35b-2f40-4253-b358-c827427772ed	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	USD	USD	103.20000000	\N	\N	0.00000000	topup	completed	Top up USD wallet	\N	pi_3RpWuCF7DfJ06Q5Y0Mg0Rrec	2025-07-27 08:54:51.918
3972489f-1301-4665-abeb-f28a4a49a973	85bed410-9b55-4cf8-9774-70b85059126f	USD	LAK	100.00000000	2100000.00000000	21000.00000000	0.50000000	exchange	completed	Exchange USD to LAK	\N	\N	2025-07-30 19:29:45.434542
76490465-2433-48ad-8ab5-43da3a42c8e1	85bed410-9b55-4cf8-9774-70b85059126f	USD	LAK	50.00000000	1050000.00000000	21000.00000000	0.25000000	exchange	completed	Exchange USD to LAK	\N	\N	2025-07-30 19:38:59.736338
6ab5170b-8cd7-453d-badd-35e378f934ed	85bed410-9b55-4cf8-9774-70b85059126f	USD	USD	51.75000000	\N	\N	0.00000000	topup	completed	Top up USD wallet	\N	pi_3RrxVAFLgjRomvql0E2Y5fya	2025-08-03 15:45:41.578068
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sunny
--

COPY public.users (id, username, email, passport_number, phone_number, nationality, password, role, is_verified, stripe_customer_id, created_at) FROM stdin;
4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	sunny	sunnythai@fairpay.la	CR4224444	+66948877955	TH	$2b$10$ORtLMNnwUV.QP1XDFKmYZuN6MvFSTe9fEnUlayiaU7854Levkr/jG	user	f	\N	2025-07-27 08:54:16.909
85bed410-9b55-4cf8-9774-70b85059126f	superadmin	admin@fairpay.la	ADMIN001	+856-20-000-0001	Lao	$2b$10$4wtmCucs4rMgo8UWbkRZ7uq9k0WmuAHnGAKnKpr646RKX6/HQ1i6O	admin	t	\N	2025-07-26 23:51:55.378
1dd481b7-0346-463e-844c-1a113f1ab683	testuser	user@fairpay.la	USR001	+1-555-0001	American	$2b$10$zAbJJwa3c/soswYTjHOh8eXo8BQUJn7iMbufGQw6pThHYR5rr/lci	user	t	\N	2025-07-27 00:01:37.414
a57443e2-1c98-4add-adbe-d4151a3dcf92	testvendor	vendor@fairpay.la	VEN001	+66-123-456789	Thai	$2b$10$dq6BlfftEYkxaEwmPsOKVuXF2PSGlcmRHABPuPs2ajZ.CYMmdWVuu	vendor	t	\N	2025-07-27 00:01:37.414
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: sunny
--

COPY public.vendors (id, user_id, business_name, business_address, business_type, business_license, tax_id, status, is_verified, approved_by, approved_at, rejection_reason, created_at) FROM stdin;
19b4d1b7-7554-44bd-81ef-999afa146476	85bed410-9b55-4cf8-9774-70b85059126f	Test Vendor 2	456 Market St, Luang Prabang	Hotel	LIC002	TAX002	approved	t	85bed410-9b55-4cf8-9774-70b85059126f	2025-07-27 00:04:29.011	\N	2025-07-26 23:54:57.755
57d8cc8f-e23c-455d-91ca-90b2469db343	85bed410-9b55-4cf8-9774-70b85059126f	Test Vendor 1	123 Main St, Vientiane	Restaurant	LIC001	TAX001	approved	t	85bed410-9b55-4cf8-9774-70b85059126f	2025-07-27 00:04:25.905	\N	2025-07-26 23:54:57.755
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: sunny
--

COPY public.wallets (id, user_id, currency, balance, created_at) FROM stdin;
12ab169a-5436-4375-86d7-63b76bda288f	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	LAK	2005000.00000000	2025-07-27 08:54:17.379
4b201c8a-65fb-4e73-b6f8-eb226b37588c	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	EUR	0.00000000	2025-07-27 08:54:17.265
9074f243-259a-404a-b98a-64ef866d9119	1dd481b7-0346-463e-844c-1a113f1ab683	USD	100.00000000	2025-07-27 00:01:38.745
bb487853-3828-4f1f-96af-e7acf6041918	a57443e2-1c98-4add-adbe-d4151a3dcf92	USD	100.00000000	2025-07-27 00:01:38.745
bf28908d-433f-49d0-9c0a-f6027dd208e9	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	USD	2.70000000	2025-07-27 08:54:17.033
f544a5be-0758-4250-96b9-9870743adc4d	4a9d56f8-6795-4a8c-ad35-04ab15aba2a5	THB	0.00000000	2025-07-27 08:54:17.151
f12c79fb-3559-4510-9288-a2994b3c451a	85bed410-9b55-4cf8-9774-70b85059126f	LAK	3150000.00000000	2025-07-30 19:29:45.412351
3ba21880-6fe7-48b9-9730-25cce99f26cb	85bed410-9b55-4cf8-9774-70b85059126f	USD	158.55000000	2025-07-27 08:24:55.681
\.


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendors vendors_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: vendors vendors_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wallets wallets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: sunny
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

