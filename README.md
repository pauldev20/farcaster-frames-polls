<div align="center">
	<img src="https://em-content.zobj.net/source/apple/391/bar-chart_1f4ca.png" align="center" width=180 heihgt=180/>
  <h1>Votelik Pollerin</h1>
	<p align="center">
    <a href="https://ethglobal.com/showcase/votelik-pollerin-u0dcs">ETHGlobal Showcase</a>
		<br/>
		<a href="#question-about-this-project">About This Project</a>
		·
		<a href="#hammer_and_wrench-how-its-made">How It's Made</a>
  	</p>
	<br/>
</div>
<br/>

# :question: About This Project
This project introduces a Farcaster Frame template for creating secure and anonymous polls. It uses MACI to enable voting privacy and prevent bribery, Pimlico for account management, and offers World ID as a voter identification method to determine eligibility.
This setup enables users to generate polls on Farcaster that are secure against bots, bribery, and collusion. The project was developed during a 36-hour Ethereum Hackathon.

**The project is split up into multiple parts**:
- **Contracts**: This contains the SignUpWorldcoinGatekeeper, this contract allows to gatekeep MACI signups by requiring new voters to verify with worldcoin
- **Frontend**: A Next.js webapp, designed for easy integration with Farcaster as a frame
- **Scripts**: Helper scripts to easily deploy MACI and calculate + submit results
- **Poll Creator**: A frontend to create polls, view active polls and view results of past polls

# :hammer_and_wrench: How It's Made
**Voting System**: A set of predefined MACI contracts that allow anonymous voting.

**Contract SignUpWorldcoinGatekeeper**: This contract allows to gatekeep MACI signups by requiring new voters to verify with World ID.

**Poll Creation**: A new MACI poll can be registered with our MACI factory.

**Web Application**: A Next.js webapp, designed for easy integration with Farcaster as a frame. Poll details like questions and options are stored in an offchain database linked to the webapp.

**Voter Registration**: Voters need to register using a method defined in the Gatekeeper contract. Our setup uses World ID for verification, employing @worldcoin/idkit-core and the Worldcoin app to create a unique nullifier hash for voting. A Pimlico Safe account is also deployed for each voter, allowing votes without gas fees, using @permissionless library.

**Voting Process**: Registered voters can choose from options set by the poll creator.

**Result Calculation and Display**: Poll outcomes are calculated through zk-snark functions within the MACI poll contract, with results displayed in the frame for public viewing.
