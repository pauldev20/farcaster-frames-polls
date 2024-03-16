/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, options) => {
		config.module.rules.push({
		  test: /\.node$/,
		  loader: 'node-loader'
		})
		config.module = {
			...config.module,
			exprContextCritical: false,
		};

		return config;
	},
};

export default nextConfig;
