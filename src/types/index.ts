// User types
export interface User {
  email: string;
  name: string;
  picture?: string;
  username: string;
  sub: string;
}

// Client types
export interface Client {
  agency_id: string;
  client_id: string;
  client_name: string;
}

// User Preferences types
export interface UserPreferences {
  email: string;
  selectedClientIds: string[];
}

// SpendWastageAction types
export interface SpendWastageAction {
  Rules: {
    application_per_dollar: number;
    application_ratio: number;
    expected_applications: number;
    spend_ratio: number;
  };
  action: string;
  agency_id: string;
  bid_type: string;
  client_id: string;
  client_name: string;
  job_category: string;
  job_city: string;
  job_country: string;
  job_group_id: string;
  job_group_name: string;
  job_id: string;
  job_ref_number: string;
  job_state: string;
  job_title: string;
  params: {
    active_days_threshold: number;
    application_threshold: number;
    cpa_threshold: number;
    spend_threshold: number;
  };
  pause_date: string;
  placement_id: string;
  publisher_name: string;
  stats: {
    JG: {
      cpa_goal: number;
      jg_pub_cum_applies: number;
      jg_pub_cum_net_spend: number;
      jg_pub_moving_avg_applies: number;
      jg_pub_moving_avg_cpa: number;
      jg_pub_moving_avg_spend: number;
    };
    JOB: {
      job_applies: number[];
      job_clicks: number[];
      job_id: string[];
      job_net_spend: number[];
    };
    TG: {
      active_days: number;
      tg_moving_avg_applies: number;
      tg_moving_avg_cpa: number;
      tg_moving_avg_spend: number;
      tg_mtd_applies: number;
      tg_mtd_net_spend: number;
      tgp_Clicks: number;
      tgp_applies: number;
      tgp_net_spend: number;
    };
  };
  trading_group_id: string | null;
} 