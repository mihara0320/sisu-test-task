import {Construct} from 'constructs';

import {GoogleProvider} from "@cdktf/provider-google/lib/provider";
import {ComputeNetwork} from "@cdktf/provider-google/lib/compute-network";
import {ComputeSubnetwork} from "@cdktf/provider-google/lib/compute-subnetwork";

interface NetworkProps {
    provider: GoogleProvider;
    vpcName: string;
    subnetName: string;
    subnetIpCidrRange: string
}
export class Network extends Construct {
    public readonly vpc: ComputeNetwork;
    public readonly subnet: ComputeSubnetwork;
    constructor(scope: Construct, id: string, props: NetworkProps) {
        super(scope, id);

        this.vpc = new ComputeNetwork(this, 'VPC', {
            name: props.vpcName,
            autoCreateSubnetworks: true,
            project: props.provider.project,
        });

        this.subnet = new ComputeSubnetwork(this, `Subnet`, {
            name: props.subnetName,
            ipCidrRange: props.subnetIpCidrRange,
            network: this.vpc.name,
            project: props.provider.project,
            region: props.provider.region,
        })
    }
}
