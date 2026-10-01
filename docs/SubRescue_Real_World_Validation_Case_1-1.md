# SubRescue — Real-World Validation Case #1

## Purpose

This document records a real-world example identified during the initial validation of **SubRescue**.

The example comes from a roommate's experience with recurring purchases/subscriptions and is being used as evidence for the problem SubRescue aims to address.

---

## Real-World User

- **User:** Roommate
- **User type:** Student
- **Financial context:** Limited monthly budget
- **Primary platform involved:** Amazon

---

## What Happened

The user had a recurring Amazon order for Yoga Bar products, mainly:

- Oats
- Peanut butter
- Protein bars

The approximate value of the automatically placed order was **₹3,000**.

She expected to receive a notification/reminder before the replacement order so that she could decide whether she still needed the products.

However, she did not notice a reminder before the order.

The recurring order was placed automatically and the payment was processed automatically.

She discovered that the replacement order had been placed only after checking her debited amount.

---

## Why the Order Was Unwanted

At the time the replacement order was placed:

- She already had sufficient stock of the products.
- She did not need another order at that point.
- The order occurred around the end/start of the month, when managing a student's limited monthly budget was particularly important.

The problem was therefore not simply that she had a subscription. The problem was that she did not have enough timely visibility to decide whether the upcoming recurring purchase was still necessary.

---

## Similar Experiences

The user also mentioned experiencing similar situations with other recurring services, including:

- Amazon Prime
- Spotify

The common concern is that recurring payments or renewals can happen when the user does not actively need the service or product at that particular time.

---

## What the User Wanted

The user specifically wanted:

### 1. Advance Reminder

A reminder **at least 5 days before** the renewal or recurring order.

This would give her enough time to decide whether she wants to:

- Continue
- Cancel
- Skip
- Prepare financially for the upcoming payment/order

### 2. One Place for Recurring Commitments

She would like to have her recurring subscriptions/pre-orders visible in **one place**.

This would make it easier to understand:

- What is going to renew
- When it will renew
- How much money is involved
- Which recurring payments/orders are coming soon

---

## Why This Is Relevant to SubRescue

This real-world example supports the initial SubRescue problem:

> **Users can lose visibility of upcoming recurring payments or orders and only realize that money has been deducted or an order has been placed after the automatic renewal has already happened.**

For a student with a limited monthly budget, an unexpected recurring payment can be particularly inconvenient.

The proposed value of SubRescue is therefore not simply subscription tracking. It is to provide **early visibility and timely reminders** so users can make a decision before an automatic recurring commitment takes effect.

---

## Initial SubRescue Requirement Derived From This Case

Based on this user experience, an initial requirement can be defined as:

> **SubRescue should notify users sufficiently before an upcoming recurring payment or order, with a default reminder window of at least 5 days.**

The product should also provide a centralized view of upcoming recurring commitments.

---

## Validation Evidence Summary

| Validation Point | Evidence |
|---|---|
| Real recurring order/payment | Yes |
| Platform involved | Amazon |
| Product category | Food/nutrition products |
| Approximate unexpected order value | ₹3,000 |
| Automatic order placement | Yes |
| Automatic payment | Yes |
| User noticed after checking debit | Yes |
| Products already available to user | Yes |
| User wanted the order at that time | No |
| Similar issue with other services | Amazon Prime, Spotify |
| Desired reminder period | At least 5 days |
| Desired centralized view | Yes |
| User willing to use SubRescue | Yes |

---

## Key Validation Insight

The strongest insight from this case is:

> **The user did not necessarily need another subscription-management feature; she needed enough warning before the recurring commitment happened so she could make an informed decision.**

This suggests that the first SubRescue MVP should prioritize:

1. Upcoming renewal/order visibility
2. Advance reminders
3. Centralized recurring-payment/subscription list
4. Clear amount and renewal date
5. Cancellation/skip guidance where applicable

More advanced features should be validated separately rather than assumed from this single case.

---

## Status

**Validation status:** Initial real-world evidence collected

**Number of users documented:** 1

**Next validation step:** Collect additional real-world cases from other users to determine whether the same problem occurs consistently across different subscription and recurring-payment categories.

**Important:** This case should be presented as one real-world validation case, not as proof that the problem affects all users.
