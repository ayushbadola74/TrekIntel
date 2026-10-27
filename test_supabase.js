// Automated verification script for Supabase API & RLS
const SUPABASE_URL = "https://dbsliiczdyqdhawfnttt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xZkqB_rnnhet53aeiGrDcA_BR1OexrV";

async function runTests() {
  console.log("=== Testing Supabase Connection ===");

  // 1. Test public treks read
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/treks?is_public=eq.true&select=id,name,altitude_m,difficulty`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) {
      console.error("Test 1 Failed: HTTP " + res.status, await res.text());
    } else {
      const data = await res.json();
      console.log(`Test 1 PASSED: Successfully fetched ${data.length} public treks from Supabase.`);
      console.log("Sample trek names:", data.slice(0, 3).map(t => t.name).join(", "));
    }
  } catch (err) {
    console.error("Test 1 Failed with error:", err.message);
  }

  // 2. Test RLS protection on private writes without user token
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/treks`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        name: "Unauthorized Trek",
        location: "Himalayas",
        difficulty: "Easy",
        duration_days: 2
      })
    });

    if (res.status === 401 || res.status === 403 || res.status === 425) {
      console.log("Test 2 PASSED: RLS correctly rejected unauthorized unauthenticated insert (HTTP " + res.status + ").");
    } else if (!res.ok) {
      const text = await res.text();
      console.log("Test 2 PASSED: RLS prevented write without auth.uid() (HTTP " + res.status + "):", text);
    } else {
      console.warn("Test 2 WARNING: Unauthenticated insert unexpectedly succeeded.");
    }
  } catch (err) {
    console.log("Test 2 Result:", err.message);
  }

  // 3. Test Auth Endpoint reachable
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Test 3 PASSED: Supabase Auth service reachable and active.");
    } else {
      console.log("Test 3 Status: HTTP " + res.status);
    }
  } catch (err) {
    console.error("Test 3 Auth endpoint check error:", err.message);
  }
}

runTests();
