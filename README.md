# Votelik Pollerin

This project introduces a Farcaster Frame template for creating secure and anonymous polls. It uses MACI to enable voting privacy and prevent bribery, Pimlico for account management, and offers World ID as a voter identification method to determine eligibility.
This setup enables users to generate polls on Farcaster that are secure against bots, bribery, and collusion.


The project is split up into multiple parts

### contracts

This contains the SignUpWorldcoinGatekeeper, this contract allows to gatekeep MACI signups by requiring new voters to verify with worldcoin.

### frontend

A Next.js webapp, designed for easy integration with Farcaster as a frame.

### scripts

Helper scripts to easily deploy MACI and calculate + submit results

### poll_creator

A frontend to create polls, view active polls and view results of past polls

