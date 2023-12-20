import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { MetamaskStateProvider } from "use-metamask";

import { HomePage } from "./pages/HomePage";
import { VersionsPage } from "./pages/VersionsPage";
import { InspectorPage } from "./pages/InspectorPage";
import { UploadPage } from "./pages/UploadPage";
import "./index.css";

const App: React.FC = () => (
	<Router>
		<Routes>
			<Route
				path="/"
				element={<HomePage />}
			/>
			<Route
				path="/versions/:tokenId"
				element={<VersionsPage />}
			/>
			<Route
				path="/inspector/:cid"
				element={<InspectorPage />}
			/>
			<Route
				path="/upload/:tokenId"
				element={
					<MetamaskStateProvider>
						<UploadPage />
					</MetamaskStateProvider>
				}
			/>
		</Routes>
	</Router>
);

export default App;
