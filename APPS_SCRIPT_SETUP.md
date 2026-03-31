# FASST Apps Script Setup

## 1. Create the `Accounts` sheet

Use this exact header row:

```text
user_id,email,password_hash,first_name,last_name,zip,created_at,last_login_at,account_type,status
```

## 2. Confirm the `Results` sheet

Use this header row style:

```text
result_id,user_id,date,athlete_name,zip,gender,grade,forty,forty_points,broad,broad_points,cmj,cmj_points,rsi,rsi_points,pro_agility,pro_points,cone,cone_points,total_score,tier,projection
```

## 3. Create the Apps Script

1. Open your Google Sheet.
2. Go to `Extensions` -> `Apps Script`.
3. Replace the default script with the contents of [google-apps-script-backend.gs](/Users/liz/Documents/FASST Calculator/google-apps-script-backend.gs).
4. Save the project.

## 4. Deploy the web app

1. Click `Deploy` -> `New deployment`.
2. Select `Web app`.
3. Execute as: `Me`
4. Who has access: `Anyone`
5. Deploy and copy the URL.

## 5. Update the widget

Before loading [app.js](/Users/liz/Documents/FASST Calculator/app.js), add:

```html
<script>
  window.FASST_WIDGET_CONFIG = {
    apiBaseUrl: "YOUR_DEPLOYED_APPS_SCRIPT_URL?route="
  };
</script>
```

Use the deployment URL with `?route=` appended so the widget can call:

- `accounts/register`
- `accounts/login`
- `results`

Example:

```html
<script>
  window.FASST_WIDGET_CONFIG = {
    apiBaseUrl: "https://script.google.com/macros/s/ABC123/exec?route="
  };
</script>
```

## 6. Important note

This is a practical prototype backend. It stores a SHA-256 password hash, which is better than plain text, but it is not a full production auth system. If you want a stronger long-term setup, the next step would be moving accounts/auth to a real backend.
