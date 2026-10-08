# Public DEV mockup — simple Cloud Run deployment plan

Updated: 2026-10-08. Plan only; nothing implemented or deployed.

## Scope

Deploy the existing static mockup to one public Cloud Run service. Automatically build and deploy whenever code is merged/pushed to `dev` in `zelto-id/zelto-identity-pulse`.

**All infrastructure belongs in `zelto-website-gcp-dev`, targeting GCP project `zelto-website-dev`. Do not modify, initialize, plan or apply anything in the production Terraform repository `zelto-website-gcp`.**

No IAP, login or viewer allowlist for this release. Anyone with the URL can open the demo. Use its generated HTTPS `run.app` URL.

## 1. Terraform: DEV infrastructure only

Use the existing DEV Terraform state, Artifact Registry, GitHub WIF provider and deployment service account.

| Setting | Value |
| --- | --- |
| Project | `zelto-website-dev` |
| Region | `europe-west1` |
| Service | `zelto-pulse-demo-dev` |
| Container | Static Nginx server on port `8080` |
| Resources | 1 vCPU, 256 MiB RAM, request-based billing |
| Scaling | Minimum `0`, maximum `1` instance |
| Access | Public ingress, IAP disabled, `invoker_iam_disabled = true` |
| Images | Existing DEV Artifact Registry repository, image name `zelto-pulse-demo-dev` |

Changes in `zelto-website-gcp-dev`:

- Add `terraform/pulse_demo.tf`: Cloud Run v2 service and a small runtime service account with no application permissions.
- Extend `terraform/ci_wif.tf`: admit `zelto-id/zelto-identity-pulse` alongside the existing repositories, keeping the `refs/heads/dev` restriction for all of them. Allow this repository to impersonate the existing DEV deploy account.
- Give that deploy account write access to the existing DEV image repository and permission to act as the new runtime account. Reuse its existing Cloud Run deployment permissions.
- Add a service URL output and a short README deployment note.

Terraform owns infrastructure and public-access settings. CI updates the container image; ignore that image field plus gcloud's client/version bookkeeping metadata. Existing DEV services, their IAP settings and expiry jobs remain unchanged.

Use the service-level public-access setting rather than an `allUsers` grant: the DEV documentation notes domain-restricted sharing. Google recommends disabling the invoker IAM check for this case. Do not change organization policies. [Cloud Run public access](https://docs.cloud.google.com/run/docs/authenticating/public).

## 2. One build-and-deploy workflow

Changes in `zelto-identity-pulse`:

- Add a Dockerfile, Nginx configuration and `.dockerignore` under `outputs/identity-pulse-demo/`.
- Copy only `dist/` into the web server. Keep `.env`, reports, snapshots, source and credentials outside the image. No CLI build or fixture regeneration is needed.
- Add `.github/workflows/deploy-demo-dev.yml` with one job.

Workflow:

1. Run on `push` to `dev` (including PR merges). No path filters: every merge to `dev` deploys. No deployment from `main` or pull-request events.
2. Check out the source and authenticate with the existing DEV WIF provider and deploy service account. Use GitHub OIDC, with no stored service-account key.
3. Build the Docker image on the GitHub runner, start it locally and smoke-test the entry page.
4. Push the image to DEV Artifact Registry, tagged with the commit SHA.
5. Update `zelto-pulse-demo-dev` to that image digest, explicitly using project `zelto-website-dev` and region `europe-west1`.
6. Wait for readiness, check the deployed revision/digest and request the public demo pages. Fail the job if any check fails; print the working URL on success.

Use one concurrency group to serialize deployments. Configure DEV-specific GitHub variables for the WIF provider, deploy account and image repository. Give the workflow `contents: read` and `id-token: write`. No Cloud Build trigger, Terraform pipeline or separate build-only mode.

## 3. First deployment

1. Review and apply the DEV Terraform changes once. Create the service with Google's standard Cloud Run hello image as a temporary bootstrap image, so no initial-image build dependency or second Terraform apply is needed.
2. Configure the workflow's DEV variables from the existing configuration and Terraform outputs.
3. Merge the container files and workflow into `dev`. The pipeline replaces the bootstrap image with the actual mockup automatically.
4. Confirm the public demo works and share its `run.app` URL. Later merges to `dev` repeat the same build-and-deploy job.

## Done when

- Terraform validation passes and the reviewed plan contains only the intended DEV changes.
- A merge to `dev` builds and deploys the expected commit.
- The entry page, workspace, both diagram pages and their assets load without signing in.
- The next Terraform plan does not revert the image deployed by CI.
- No production repository, state or resource has been changed.

Rollback: update the DEV service to the previous successful image digest. No Terraform or access changes are needed.

Custom domains, website embedding, authentication and further infrastructure are outside this release.

## Implementation and operation

The container, workflow and DEV Terraform are implemented. The workflow requires these repository variables (not secrets):

| Variable | DEV value |
| --- | --- |
| `DEV_WIF_PROVIDER` | `projects/681428109463/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `DEV_DEPLOY_SERVICE_ACCOUNT` | `gh-deploy@zelto-website-dev.iam.gserviceaccount.com` |
| `DEV_DEMO_IMAGE` | `europe-west1-docker.pkg.dev/zelto-website-dev/zelto-images/zelto-pulse-demo-dev` |

Apply the owning DEV Terraform first, using the named targets documented in that repository's `docs/PULSE_DEMO_DEPLOYMENT.md`. Merge/push this workflow to `dev` only after infrastructure is ready. The workflow authenticates after the local build and smoke checks, so the short-lived OIDC credentials are used immediately for deployment.

Local preview:

```sh
docker build -t pulse-demo outputs/identity-pulse-demo
docker run --rm -p 127.0.0.1:8080:8080 pulse-demo
```

Open `http://localhost:8080/`. No npm install, CLI build or credentials are needed. The Nginx base image is pinned by digest; update that pin deliberately for base-image updates. The deploy job's summary records the public URL, commit and image digest. Rerun a previous successful workflow run to rebuild and deploy that commit for rollback.

Validation so far: container build and actionlint passed; all 24 static files match the source over HTTP; private/missing paths return 404; business and technical workspaces and both diagrams render in the browser. DEV Terraform validation and CI security scanning passed with pre-existing warnings. The three GitHub deployment variables are configured.

Implementation PRs: [static container and workflow #2](https://github.com/zelto-id/zelto-identity-pulse/pull/2), [DEV Terraform #28](https://github.com/zelto-id/zelto-website-gcp-dev/pull/28), both merged to `dev`. DEV Terraform was applied on 2026-10-08: 5 additions, 1 WIF condition update, 0 destroys, with no existing service changes.

The [first successful deployment](https://github.com/zelto-id/zelto-identity-pulse/actions/runs/37741583534) deployed commit `5b2c5978cac6f1e077060141506b5f8ec2a00271` and passed readiness, traffic, image-digest and all 24 public file checks. The initial startup smoke check was corrected to retry connection resets while Nginx starts. The [live mockup](https://zelto-pulse-demo-dev-xd4ms6zu5q-ew.a.run.app) also passed browser verification without sign-in. Public access is enabled, IAP is off, and the runtime has no environment variables or mounted secrets. Post-deployment Terraform review found zero resource changes after declaring the returned minimum-scaling default and excluding only CI image/client metadata from drift.
