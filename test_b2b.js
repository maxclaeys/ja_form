/* Coverage test for the B2B branch.
   Uses the REAL showIf evaluator lifted verbatim from index.html, so this
   tests the shipped logic rather than a reimplementation of it. */

global.window = {};
require('./flow.js');
const FLOW = window.JA_FLOW;

/* --- verbatim from index.html --- */
function truthy(v){
  if(v===undefined||v===null) return false;
  if(Array.isArray(v)) return v.length>0;
  if(typeof v==='object') return Object.values(v).some(n=>Number(n)>0);
  return String(v).trim()!=='';
}
function testCond(c,a){
  const v=a[c.q];
  if('answered' in c) return truthy(v)===c.answered;
  if('eq'  in c) return v===c.eq;
  if('in'  in c) return c.in.includes(v);
  if('has' in c) return Array.isArray(v)&&v.includes(c.has);
  if('hasAny' in c) return Array.isArray(v)&&c.hasAny.some(x=>v.includes(x));
  if('gt'  in c) return Number(v||0)>c.gt;
  return false;
}
function visible(q,a){
  if(!q.showIf) return true;
  const {all,any}=q.showIf;
  if(all&&!all.every(c=>testCond(c,a))) return false;
  if(any&&!any.some(c=>testCond(c,a))) return false;
  return true;
}
const isInput = q => q.type!=='notice';
/* --- end verbatim --- */

const shown = a => FLOW.questions.filter(q => isInput(q) && visible(q,a)).map(q=>q.id);

const cases = {

  /* ABSA — Casey Flanagan. US operator, sports exchange, event 2028,
     two-year preparation phase, youth teams plus travelling families. */
  ABSA: {
    answers: {
      party_type:"b2b_agent", b_org_name:"American Based Sports Abroad",
      b_org_type:"operator_reseller", b_country:"United States", b_relationship:"in_touch",
      b_need:["local_partner","site_inspection"],
      b_maturity:"concept_dates", b_objectives:"Sports exchange tour, 2028",
      b_size_known:"band", b_size_band:"30_50",
      b_composition:["under18","families","staff","supporters"],
      b_origin:"Dallas Fort Worth", b_japan_experience:"new_abroad",
      b_supervision_ratio:"per team", b_safeguarding:["emergency_contact","medical"],
      b_insurance_constraint:"undecided",
      b_dates_firmness:"window", b_date_from:"2028-07-01", b_date_to:"2028-07-31",
      b_nights:10, b_frequency:"pilot",
      b_purpose:["sport","culture"],
      b_sport:"Softball", b_games_count:5, b_level:"club", b_age_gender:"Youth, women",
      b_opponent_pref:"similar", b_rest_days:"rest_day", b_kit_logistics:["laundry"],
      b_supporters:"separate_programme",
      b_themes:["food"], b_pace:"balanced", b_exclusivity:"mostly", b_comfort:"34",
      b_scope:["land","partner_sourcing","local_rep","event_planning","inspection","staffing"],
      b_prep_phase:"substantial", b_prep_duration:"2yp",
      b_pricing_basis:"size_band", b_brand:"yours", b_prep_budget:"not_discussed",
      b_next_step:"agreement", b_proposal_deadline:"2026-09-30",
      b_contact_name:"Casey Flanagan", b_contact_email:"casey@theabsa.com"
    },
    mustSee: ["b_sport","b_rest_days","b_kit_logistics","b_supporters","b_prep_phase",
              "b_prep_duration","b_prep_budget","b_incumbent","b_size_band",
              "b_supervision_ratio","b_japan_experience","b_objectives"],
    mustNotSee: ["b_brief_paste","b_change_wanted","b_year_levels","b_procurement",
                 "b_size_exact","trip_type","md_regions","sd_theme"]
  },

  /* Kammui — Max Mackee. Brand curator, fully specified 2N/3D outline,
     four adults, hard deadline, wants photos for a launch page. */
  KAMMUI: {
    answers: {
      party_type:"b2b_agent", b_org_name:"Kammui", b_org_type:"brand_curator",
      b_country:"Japan", b_relationship:"in_touch",
      b_need:["estimate"],
      b_maturity:"fixed_itinerary",
      b_brief_paste:"Stop 3 - Takamatsu, Seto Inland Sea & Iya Valley. 2 nights / 3 days...",
      b_fixed_elements:["route","experiences"],
      b_size_known:"exact", b_size_exact:4,
      b_composition:["adults"], b_origin:"Takamatsu Airport", b_japan_experience:"experienced",
      b_dates_firmness:"flexible", b_nights:2, b_frequency:"multiple",
      b_purpose:["culture"],
      b_themes:["islands","art","food"], b_pace:"unhurried",
      b_exclusivity:"private", b_comfort:"character",
      b_scope:["land","marketing"], b_prep_phase:"none",
      b_pricing_basis:"net_margin", b_brand:"ours",
      b_proposal_deadline:"2026-05-22", b_next_step:"proposal",
      b_contact_name:"Max Mackee", b_contact_email:"max@kammui.com"
    },
    mustSee: ["b_brief_paste","b_fixed_elements","b_themes","b_exclusivity","b_comfort",
              "b_size_exact","b_incumbent","b_pricing_basis","b_brand","b_proposal_deadline",
              "b_prior_experience"],
    mustNotSee: ["b_supervision_ratio","b_safeguarding","b_insurance_constraint",
                 "b_sport","b_rest_days","b_year_levels","b_procurement",
                 "b_prep_duration","b_prep_budget","b_change_wanted","b_objectives",
                 "b_size_band","trip_type"]
  },

  /* Shailer Park State School — Thomas Harrison. Institution, prior 2025
     itinerary to improve, minors, mandated insurer, formal RFP checklist. */
  SHAILER: {
    answers: {
      party_type:"b2b_group", b_org_name:"Shailer Park State School",
      b_org_type:"school", b_country:"Australia", b_relationship:"first",
      b_need:["full_proposal"],
      b_maturity:"prior_itinerary",
      b_brief_paste:"2025 itinerary: 4 nights Tokyo, 2 nights Kyoto, 1 night Hiroshima...",
      b_fixed_elements:["dates"],
      b_change_wanted:"More time in Kyoto and Hiroshima. Closer dinner venues.",
      b_size_known:"band", b_size_band:"20_30",
      b_composition:["students","staff"],
      b_origin:"Brisbane", b_japan_experience:"new_japan",
      b_supervision_ratio:"3 teachers, 2-4 parent chaperones",
      b_safeguarding:["risk_assessment","emergency_contact","medical"],
      b_insurance_constraint:"mandated",
      b_dates_firmness:"fixed", b_date_from:"2027-09-23", b_date_to:"2027-10-01",
      b_nights:8, b_frequency:"annual",
      b_purpose:["education","culture"],
      b_year_levels:"Years 5 and 6", b_curriculum_link:["language","history"],
      b_school_exchange:"visit",
      b_reporting:["briefing","risk_docs","parent_evening"],
      b_themes:["landscape"], b_pace:"balanced", b_exclusivity:"mostly", b_comfort:"34",
      b_scope:["land","flights","risk","group_leader"], b_prep_phase:"none",
      b_pricing_basis:"per_person", b_brand:"yours",
      b_procurement:["insurer"],
      b_proposal_deadline:"2026-10-31", b_next_step:"proposal",
      b_contact_name:"Tom Harrison", b_contact_email:"twhar0@eq.edu.au"
    },
    mustSee: ["b_brief_paste","b_change_wanted","b_year_levels","b_curriculum_link",
              "b_school_exchange","b_reporting","b_supervision_ratio","b_safeguarding",
              "b_insurance_constraint","b_procurement","b_size_band"],
    mustNotSee: ["b_sport","b_rest_days","b_kit_logistics","b_prep_duration",
                 "b_prep_budget","b_incumbent","b_objectives","b_size_exact",
                 "b_event_component","trip_type"]
  }
};

/* B2C regression: a consumer must never see a single B2B question */
const B2C = { party_type:"b2c_self", trip_type:"multi_day" };

let fail = 0;
for (const [name, c] of Object.entries(cases)) {
  const vis = shown(c.answers);
  const missing = c.mustSee.filter(id => !vis.includes(id));
  const leaked  = c.mustNotSee.filter(id => vis.includes(id));
  const unanswered = vis.filter(id => {
    const q = FLOW.questions.find(x=>x.id===id);
    return q.required && !truthy(c.answers[id]);
  });
  const ok = !missing.length && !leaked.length;
  if (!ok) fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${name.padEnd(8)} ${String(vis.length).padStart(2)} questions`);
  if (missing.length) console.log(`        missing: ${missing.join(', ')}`);
  if (leaked.length)  console.log(`        leaked : ${leaked.join(', ')}`);
  if (unanswered.length) console.log(`        note: required but unanswered in fixture: ${unanswered.join(', ')}`);
}

const b2cLeak = shown(B2C).filter(id => id.startsWith('b_'));
if (b2cLeak.length) { fail++; console.log(`FAIL  B2C regression: leaked ${b2cLeak.join(', ')}`); }
else console.log(`PASS  B2C      ${shown(B2C).length} questions, no B2B leakage`);

/* every B2B question must be reachable by at least one of the three */
const allVis = new Set(Object.values(cases).flatMap(c => shown(c.answers)));
const unreachable = FLOW.questions
  .filter(q => isInput(q) && q.id.startsWith('b_') && !allVis.has(q.id))
  .map(q => q.id);
console.log(unreachable.length
  ? `NOTE  unreachable by all three cases: ${unreachable.join(', ')}`
  : `PASS  every B2B question reachable by at least one case`);

process.exit(fail ? 1 : 0);
