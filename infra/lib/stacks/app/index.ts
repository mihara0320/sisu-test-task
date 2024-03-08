import {GcsBackend, TerraformStack} from 'cdktf';
import {GoogleProvider} from "@cdktf/provider-google/lib/provider";
import {Construct} from "constructs";

import {Network} from "../../constructs/network";
import {Database} from "../../constructs/database";
import {ContainerCluster} from "@cdktf/provider-google/lib/container-cluster";
import {ServiceAccount} from "@cdktf/provider-google/lib/service-account";
import {ContainerNodePool} from "@cdktf/provider-google/lib/container-node-pool";
import {ArtifactRegistryRepository} from "@cdktf/provider-google/lib/artifact-registry-repository";
import {ProjectIamMember} from "@cdktf/provider-google/lib/project-iam-member";

const TF_STATE_BUCKET = "sisu-test-tfstate"
const PROJECT_ID = "tactical-runway-416416"
const REGION = "europe-central2"
class AppStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        new GcsBackend(this, {
            bucket: TF_STATE_BUCKET,
            prefix: "terraform/state",
        });

        const googleProvider = new GoogleProvider(this, "Google", {
            project: PROJECT_ID,
            region: REGION,
        });

        const googleProviderBeta = new GoogleProvider(this, "GoogleBeta", {
            project: PROJECT_ID,
            region: REGION,
            alias: 'beta',
        });

        const network = new Network(this, 'Network', {
            provider: googleProvider,
            vpcName: 'main-vpc',
            subnetName: 'primary-subnet',
            subnetIpCidrRange: '10.0.0.0/24'
        });

        const serviceAccount = new ServiceAccount(this, 'GkeServiceAccount', {
            accountId: 'gke-service-account',
            displayName: 'GKE Service Account',
        });

        new ProjectIamMember(this, 'ArtifactRegistryReaderBinding', {
            provider: googleProvider,
            project: PROJECT_ID,
            role: 'roles/artifactregistry.reader',
            member: `serviceAccount:${serviceAccount.email}`,
        });

        const gkeCluster = new ContainerCluster(this, 'GkeCluster', {
            provider: googleProviderBeta,
            name: 'main-cluster',
            location: REGION,
            network: network.vpc.id,
            subnetwork: network.subnet.name,
            initialNodeCount: 1,
            removeDefaultNodePool: true,
            deletionProtection: false
        });

        new ContainerNodePool(this, 'GkeNodePool', {
            provider: googleProviderBeta,
            name: 'main-node-pool',
            location: REGION,
            cluster: gkeCluster.name,
            initialNodeCount: 1,
            nodeConfig: {
                machineType: 'n1-standard-1',
                oauthScopes: [
                    'https://www.googleapis.com/auth/cloud-platform',
                ],
                serviceAccount: serviceAccount.email,
            },
            autoscaling: {
                minNodeCount: 1,
                maxNodeCount: 5,
            },
        });

        new ArtifactRegistryRepository(this, 'Registry', {
            provider: googleProviderBeta,
            format: "DOCKER",
            repositoryId: "docker-registry"
        })

        new Database(this, 'Database', {
            provider: googleProvider,
            region: REGION,
            instanceName: 'express-sql-instance',
            databaseName: 'express-database',
            userName: 'express-user',
            password: process.env.SQL_USER_PASSWORD || 'securePass',
            databaseVersion: 'POSTGRES_12',
            tier: 'db-f1-micro',
        })
    }
}

export default AppStack;