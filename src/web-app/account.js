import { SAMPLE_ALERTS, SAMPLE_PROFILE, SAMPLE_SECURITY, SAMPLE_VERIFICATION } from './demoData.js';
import { useStored } from './format.jsx';

// The signed-in person's profile and settings, shared by the Settings page and the top bar.
// No account backend is connected yet, so everything is kept in this browser.

export const useProfile = () => useStored('wa-profile', SAMPLE_PROFILE);
export const useSecurity = () => useStored('wa-security', SAMPLE_SECURITY);
export const useAlerts = () => useStored('wa-alerts', SAMPLE_ALERTS);
export const useVerification = () => useStored('wa-verification', SAMPLE_VERIFICATION);
export const useDeletionRequest = () => useStored('wa-deletion-request', null);

export const fullName = (profile) => [profile.firstName, profile.lastName].filter(Boolean).join(' ');

// ISO 3166 country codes; names come from the browser in the reader's language
const CODES =
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW';

let countries;
export function countryList() {
  if (!countries) {
    const names = new Intl.DisplayNames(undefined, { type: 'region' });
    countries = CODES.split(' ')
      .map((code) => ({ code, name: names.of(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return countries;
}
