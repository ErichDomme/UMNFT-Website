import { HashRouter as Router, Routes, Route } from "react-router-dom";
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
				path="/inspector/:tokenId"
				element={<InspectorPage />}
			/>
			<Route
				path="/upload"
				element={<UploadPage />}
			/>
		</Routes>
	</Router>
);

export default App;
