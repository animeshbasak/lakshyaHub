import type { ArchetypeGuide } from './ai-platform'

export const dataEngineeringGuide: ArchetypeGuide = {
  slug: 'data-engineering',
  archetype: 'data-engineering',
  title: 'How to land a Data Engineer role in 2026',
  metaDescription: 'A senior-IC playbook for landing Data Engineer roles in 2026 — what hiring managers screen for at Snowflake / Databricks / Airbnb / fintech / data-platform companies, the SQL + pipelines + dbt loop, salary bands, and how data eng candidates score on the career-ops A-G rubric.',
  tagline: 'Move data correctly. Make analysts trust the warehouse.',
  publishedAt: '2026-04-25',
  updatedAt: '2026-04-25',

  intro: `
Data Engineer in 2026 is a discipline of correctness and trust. The work is shipping pipelines that move data from a hundred sources to one warehouse without dropping records, getting late-arriving facts, mishandling timezones, or breaking when an upstream schema changes. Analysts, product managers, ML engineers, and executives downstream all build on what you ship. If your warehouse is wrong, all of their work is wrong.

The discipline matured sharply through 2020-25. dbt as a transformation framework. Snowflake, BigQuery, Redshift as warehouses. Airflow, Dagster, Prefect for orchestration. Fivetran, Stitch, Hightouch for ingest. The senior-IC bar: you've shipped pipelines that handle 1B+ row tables daily, you've debugged a data-quality incident, and you can articulate why your modeling decisions chose this trade-off over that.

Lakshya's eval corpus has 90+ A-G evaluations against data engineering roles across 60 companies. The pattern that scores 4.0+ is data-correctness narrative + pipeline-scale numbers.
  `.trim(),

  whoHires: [
    'Data-platform companies (Snowflake, Databricks, Confluent, MotherDuck)',
    'Big tech data orgs (Airbnb, Netflix, Spotify, Stripe Data, Meta data infra)',
    'Fintech with regulatory data requirements (Plaid, Brex, Mercury, Razorpay, banks\' tech orgs)',
    'AI-native companies needing fresh training / RAG data pipelines (Anthropic, OpenAI, Cohere)',
    'Vertical SaaS where data is the moat (Glean, Hex, Mode, Census, Hightouch)',
  ],

  sections: [
    {
      heading: 'What this archetype actually does',
      body: `
Senior-IC data engineering in 2026:

— **Pipeline ownership.** From source (transactional DB / event stream / SaaS API) to warehouse table that analysts query. You design extraction, schema mapping, transformation, validation, alerting. You\'ve operated pipelines at >1B rows / day.

— **dbt at scale.** Models, tests, snapshots, exposures, seeds. Refactor a 200-model project. Maintain code-coverage discipline. Write custom macros. The senior-IC differential: you\'ve owned the dbt project\'s health metrics over 12+ months, not just contributed models.

— **Warehouse design.** Snowflake / BigQuery / Redshift / Databricks Delta — schema design, partitioning, clustering, access patterns. Cost analysis. You\'ve cut warehouse compute spend on a real workload.

— **Orchestration ownership.** Airflow / Dagster / Prefect at production. Retry logic. Idempotency. Backfill discipline. You\'ve owned a pipeline failure that paged you and shipped the fix.

— **Data quality discipline.** Tests in dbt or Great Expectations. Anomaly detection on pipeline outputs. Late-arriving fact handling. Schema-evolution discipline (additive only, deprecation cycles). You\'ve owned a data-quality incident.

— **Streaming literacy.** Kafka / Kinesis / Pulsar at intermediate depth. CDC patterns (Debezium / Maxwell). When to choose batch vs streaming for a given workload. The 2026 senior bar: you can articulate why this pipeline is batch and that one is streaming, not just default-route.

— **Privacy + compliance baseline.** PII handling, retention, GDPR / CCPA / HIPAA controls if regulated industry. Row-level security in the warehouse. You\'ve mapped a compliance requirement to actual SQL.

— **Cross-functional partnership.** With analysts (data dictionary, SQL audit), with backend (event-schema design), with ML (feature pipelines, training-data freshness). Senior data eng is half communication.

If you\'ve shipped 5-6 of these, you\'re at the senior-IC bar.
      `.trim(),
    },
    {
      heading: 'Why now (the 2026 data engineering market)',
      body: `
Three trends shape 2026 hiring:

— **AI-readiness is the new data-quality bar.** Companies want pipelines that produce ML-grade data: deterministic, auditable, freshness-tracked. Senior data engineers who can articulate vector / embedding pipeline patterns alongside traditional warehouse work are most-hired in 2026. AI-native companies (Anthropic, Perplexity, Cohere) hire data engineers explicitly for RAG-pipeline + training-data-pipeline work.

— **dbt + Snowflake / BigQuery is the consensus stack.** A data engineer in 2026 with neither is at a disadvantage. Smaller engineering shops have consolidated on this stack; larger Databricks / Spark-heavy shops are the alternative. Pick one.

— **Cost discipline matters again.** Post-2022 macro shift made warehouse cost optimization a senior-IC differentiator. Candidates who can articulate dbt model materialization choices (table vs view vs incremental vs ephemeral) tied to compute spend pull ahead.

If you're a backend engineer pivoting into data: the 2026 path is dbt + warehouse SQL + one orchestrator. Don't try to learn Spark + Kafka + dbt + warehouse + ML simultaneously; depth in one stack matters more.
      `.trim(),
    },
    {
      heading: 'How to position your resume',
      body: `
Data engineering resumes get rejected most often on Block C ("operational specificity") because most bullets read as tool-list deliveries. Below-4.0 patterns:

— **Tool-tour resume.** "Built ETL pipelines using Airflow, Spark, Kafka, dbt, Snowflake." Catalog without scale or correctness narrative. Senior screeners pattern-match to junior.

— **No row counts / SLA numbers.** "Built a pipeline" without "processing 1.2B rows / day" is empty.

— **No data-quality story.** Resume features pipelines built but no incident debugged, no schema-evolution discipline owned, no test coverage % moved.

— **No cost / scale data.** Senior+ data eng without Snowflake / BigQuery cost numbers reads as junior at scale.

Rewrite to surface:

— **Numbers that imply scale.** "Owned the events pipeline processing 1.4B rows / day from Kafka to Snowflake; designed late-arriving-fact handling that reduced backfill frequency from weekly to monthly."
— **Trade-offs explicitly named.** "Migrated dbt model from view to incremental materialization; cut compute spend 38% at the cost of slightly more complex idempotency logic, documented in RFC."
— **Failure modes you owned.** "Diagnosed silent data-loss when upstream API rate-limited; designed checkpoint-and-resume mechanism that prevented the failure mode across 12 ingest pipelines."
— **Compliance work surfaced.** "Mapped GDPR Article 17 erasure to SQL via row-level retention policy; partnered with legal on audit trail."

Lakshya\'s archetype detector classifies data engineering JDs cleanly via warehouse / dbt / Airflow / Spark keywords. Distinct from ai-platform (which is LLM-specific) and ml-engineer-equivalent paths.
      `.trim(),
    },
  ],

  interviewLoop: [
    {
      stage: 'Recruiter screen',
      format: '20-30 min phone',
      signal: 'Logistics + comp + visa + warehouse familiarity',
      prep: 'Pre-decide on warehouse: "Snowflake-leaning data engineer with dbt + Airflow background." Specific.',
    },
    {
      stage: 'Hiring manager call',
      format: '45-60 min',
      signal: 'Can you talk about pipelines with depth — correctness, scale, cost? Have you owned a data-quality incident?',
      prep: '2 stories: a pipeline you scaled, a data-correctness incident you debugged. Numbers + before/after.',
    },
    {
      stage: 'SQL deep-dive',
      format: '60-90 min',
      signal: 'Senior-IC SQL fluency. Window functions, CTEs, lateral joins, query plan reading.',
      prep: 'Practice 4 problem types: (1) sessionization with gap-filling, (2) cohort retention with date_diff, (3) slowly-changing-dimension Type 2 implementation, (4) running-total + percent-of-total in single query.',
    },
    {
      stage: 'Pipeline / system design',
      format: '60-90 min',
      signal: 'Can you architect a pipeline end-to-end? Source → ingest → warehouse → transformation → exposure?',
      prep: 'Pre-draft 4 systems: (1) clickstream pipeline at 100M events/day, (2) GDPR-compliant CDC pipeline from production Postgres, (3) RAG-ingest pipeline for LLM application, (4) ML feature store for product-recommendation model.',
    },
    {
      stage: 'Data modeling case',
      format: '60 min',
      signal: 'Pick a domain. Design a star schema, fact / dim grain, accumulating snapshot, late-arriving handling.',
      prep: 'Practice modeling 4 domains aloud: e-commerce orders, financial transactions, healthcare claims, ad-impression-attribution.',
    },
    {
      stage: 'Behavioral / values',
      format: '45 min',
      signal: 'Cross-functional partnership with analysts + backend + ML. Incident ownership. Schema-evolution discipline.',
      prep: '4 STAR+R stories — analyst-engineer partnership, schema-change you defended, data-quality incident, mentorship.',
    },
  ],

  skills: [
    {
      category: 'Required',
      skills: ['Senior-IC SQL — window functions, CTEs, query plan reading', 'One warehouse: Snowflake / BigQuery / Redshift / Databricks at production', 'dbt at intermediate depth — models, tests, materializations', 'One orchestrator: Airflow / Dagster / Prefect at production', 'Python at production quality', 'Data-quality discipline — testing, anomaly detection, schema evolution', 'Cost analysis on warehouse spend'],
    },
    {
      category: 'Preferred',
      skills: ['Streaming hands-on (Kafka / Kinesis / Pulsar)', 'CDC patterns (Debezium / Maxwell / Estuary)', 'Ingest tooling (Fivetran / Stitch / Hightouch)', 'Multi-warehouse experience (helps with portability narratives)', 'PII / compliance hands-on at scale', 'Reverse-ETL fundamentals (Census / Hightouch / Polytomic)'],
    },
    {
      category: 'Bonus',
      skills: ['dbt-Cloud / dbt-Core advanced patterns (custom macros, exposures, semantic layer)', 'Spark / Databricks at production scale', 'ML feature store hands-on (Feast / Tecton / Hopsworks)', 'Open-source contribution to dbt / Airflow / DuckDB / Polars', 'Public talk / blog post on data-engineering pattern'],
    },
  ],

  salaryBands: [
    { region: 'US (SF / NY)',     iC: '$160-240k',  staff: '$240-380k',  principal: '$380-620k+', source: 'levels.fyi 2026Q1, FAANG data eng + Snowflake / Databricks bands' },
    { region: 'US (Remote)',      iC: '$140-210k',  staff: '$210-320k',  principal: '$320-500k',  source: 'levels.fyi geo-adjusted data eng' },
    { region: 'India (metro)',    iC: '₹25-50 LPA', staff: '₹50-100 LPA', principal: '₹100-200 LPA', source: 'levels.fyi India + Razorpay / Cred / Slice data eng' },
    { region: 'Europe (London)',  iC: '£75-120k',   staff: '£120-180k',  principal: '£180-280k',  source: 'levels.fyi UK + Wise / Spotify London' },
    { region: 'Europe (Berlin)',  iC: '€70-110k',   staff: '€110-170k',  principal: '€170-260k',  source: 'kununu + Personio / Tier / Delivery Hero' },
  ],

  rejectionPatterns: [
    {
      pattern: '"Tool-tour resume"',
      why: 'Resume reads as a tech catalog: Airflow, Spark, Kafka, dbt, Snowflake, Fivetran. No problem statement, scale, or correctness story.',
      recovery: 'Pick 5 bullets per role. Each bullet must contain: the data problem, the technical choice, a number that implies scale (rows / day, GB / day, table size), and the trade-off. Drop everything else.',
    },
    {
      pattern: '"No data-quality narrative"',
      why: 'Resume describes pipelines built but no incident debugged, no test-coverage moved, no schema-evolution discipline owned. Hiring committee fears candidate ships pipelines that look right but rot silently.',
      recovery: 'Add 1-2 bullets explicitly on data-quality work: tests authored, incident postmortems owned, schema-evolution policies defended.',
    },
    {
      pattern: '"No warehouse cost work"',
      why: 'Senior+ data eng at a Snowflake / BigQuery shop with no cost story. In 2026 cost discipline is a senior-IC differentiator.',
      recovery: 'Calculate actual cost numbers retroactively on a workload you shipped. Add 1 bullet: "Reduced Snowflake compute spend on the events pipeline 38% via materialization-strategy refactor; saved $144k annualized."',
    },
    {
      pattern: '"Title-grade gap"',
      why: 'Senior or Staff title at smaller shop with primarily small-table dbt work. No 1B+ row pipelines, no incident ownership at scale.',
      recovery: 'Be honest about scope. Senior-IC at a smaller shop is fine; pretending it\'s Staff at a 1000-engineer org through verbal gymnastics ages poorly in interviews.',
    },
  ],

  faq: [
    {
      q: 'dbt vs Spark — which to bet on in 2026?',
      a: 'dbt + warehouse (Snowflake / BigQuery / Redshift / Databricks SQL) is the consensus stack at most modern shops. Spark / Scala remains relevant at Databricks-first companies (Netflix, large Hadoop legacy shops). For most senior-IC roles in 2026, dbt fluency matters more than Spark.',
    },
    {
      q: 'Should I learn streaming (Kafka / Flink) seriously?',
      a: 'Useful for senior bar at companies with real-time requirements (fintech, ad-tech, IoT). Less critical at SaaS shops with batch-friendly workloads. Don\'t spend 6 months learning Flink unless your target role explicitly requires it.',
    },
    {
      q: 'AI / RAG-pipeline work — separate from data engineering?',
      a: 'Increasingly part of the role at AI-native companies. Vector store ingest pipelines, embedding generation, freshness tracking — these are data engineering work with LLM-specific patterns. Senior data engineers in 2026 should be able to design a RAG-ingest pipeline at a whiteboard level.',
    },
    {
      q: 'Will agents replace data engineering?',
      a: 'Compresses bottom-50% (basic dbt model authoring, simple Airflow DAGs, schema mapping). Doesn\'t touch top-50% (data-quality discipline, modeling decisions, cost optimization, compliance work). Senior IC data eng gets more leveraged.',
    },
    {
      q: 'Backend → data engineering — is that the right path?',
      a: 'Yes, common arc. The investment: 6 months on dbt + warehouse SQL + one orchestrator. Backend engineers transitioning often struggle with senior-IC SQL (window functions, query plan reading) — practice this specifically.',
    },
    {
      q: 'How does Lakshya help specifically for this archetype?',
      a: 'Three ways: (1) the archetype detector classifies data eng JDs cleanly via warehouse / dbt / Airflow keywords. Distinct from ai-platform and backend. (2) The CV tailor reframes pipeline work into correctness + scale + trade-off language. (3) The story bank captures data-quality-incident stories tagged "data-engineering" — high reuse value.',
    },
  ],
}
