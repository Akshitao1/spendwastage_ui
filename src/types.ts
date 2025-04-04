export interface User {
  username: string;
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Client {
  client_id: string;
  client_name: string;
  agency_id: string;
}

export interface UserPreferences {
  selectedClientIds: string[];
  isLoading: boolean;
  error: string | null;
}

export interface Stats {
  JOB: {
    job_applies: number[];
    job_clicks: number[];
    job_id: string[];
    job_net_spend: number[];
  };
  JG: {
    jg_pub_cum_applies: number;
    jg_pub_cum_net_spend: number;
    jg_pub_moving_avg_applies: number;
    jg_pub_moving_avg_cpa: number;
    jg_pub_moving_avg_spend: number;
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
}

export interface SpendWastageAction {
  job_id: string;
  job_title: string;
  job_ref_number: string;
  job_group_id: string;
  job_group_name: string;
  job_category: string;
  job_city: string;
  job_state: string;
  job_country: string;
  publisher_name: string;
  placement_id: string;
  action: string;
  pause_date: string;
  client_id: string;
  client_name: string;
  trading_group_id: string;
  rules: {
    application_per_dollar: number;
    application_ratio: number;
    expected_applications: number;
    spend_ratio: number;
  };
  stats: {
    JOB: {
      job_applies: number[];
      job_clicks: number[];
      job_net_spend: number[];
    };
    TG: {
      tg_mtd_applies: number;
      tg_mtd_clicks: number;
      tg_mtd_net_spend: number;
      tgp_applies: number;
      tgp_net_spend: number;
      active_days: number;
    };
    JG: {
      jg_pub_cum_applies: number;
      jg_pub_cum_clicks: number;
      jg_pub_cum_net_spend: number;
      cpa_goal: number;
    };
  };
} 