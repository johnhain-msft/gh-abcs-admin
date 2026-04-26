# 1 - Introduction to Repository Webhooks and Events
In this lab you will create and test webhooks and events
> Duration: 5-10 minutes

> **⏱️ Estimated time:** 10 minutes | **Type:** Self-Paced Extension
>
> **What you'll learn:**
> - How to create and configure a repository webhook
> - How to inspect webhook event payloads and headers
> - How webhook delivery channels work with tools like smee.io

> **Note:** As an enterprise admin, webhooks are a cornerstone of governance automation. Organizations use webhooks to integrate with audit and compliance systems (e.g., forwarding events to a SIEM), orchestrate CI/CD pipelines, and monitor repository activity at scale. Understanding webhook configuration at the repository level is the foundation for designing organization-wide event-driven workflows.

References:
- [About webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks)
- [Creating webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks/creating-webhooks)
- [Securing your webhooks](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks)
- [Webhook events and payloads](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads)

## 1.1 Add repository webhook

1. Open a new browser window and go to: [smee.io](https://smee.io)
2. Create a new channel by clicking on the button `Start a new channel`
3. Copy the `Webhook Proxy URL`
4. Navigate to the `Settings > Webhooks` page of your own repository

> **Note:** If you do not see the `Settings` tab or the `Webhooks` option, ensure you have admin access to the repository. Only users with admin permissions can configure webhooks.

5. Click on `Add webhook`
6. Paste the copied webhook proxy url into the field `Payload URL`
7. Change the `Content type` to `application/json`

> **Tip:** Always use `application/json` as the content type for webhooks. The default `application/x-www-form-urlencoded` encodes the payload as a form parameter, making it harder to parse in most integration tools.

8. Select `Send me everything` for the events to trigger this webhook
9. Click `Add webhook`
10. You should see a new webhook added to your repository
11. Click on `Edit` button for the recently added webhook
12. Switch to `Recent Deliveries` tab to see the ping event generated with the webhook creation
13. Investigate the headers and the payload
14. Navigate back to your webhook delivery channel created on step 2)
15. _(Optional)_ Create an issue, push code, open a pull request, add a label to see the triggered events and to investigate the payloads.

> **Note:** If your smee.io channel does not show any events after adding the webhook, check that your browser has not blocked the smee.io page and that your network allows WebSocket connections. Some corporate firewalls may block smee.io traffic.

## ✅ Verification Checklist

Before moving on, confirm:

- [ ] A webhook is configured on your repository pointing to a smee.io proxy URL
- [ ] The `Recent Deliveries` tab shows a successful ping event (green checkmark)
- [ ] You can inspect the headers and JSON payload of a delivered webhook event
