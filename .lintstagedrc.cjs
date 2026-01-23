const isUiPath = (filePath) => filePath.includes("/ui/");

module.exports = {
	"*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": (files) => {
		const filtered = files.filter((filePath) => !isUiPath(filePath));
		if (filtered.length === 0) {
			return [];
		}
		return `biome check --write ${filtered.join(" ")}`;
	},
};
