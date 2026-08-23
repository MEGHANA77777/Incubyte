import { useState } from "react";
import { checkHealth } from "../services/api";

const Dashboard = () => {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleHealthCheck = async () => {
    try {
      setLoading(true);
      setError("");
      setStatus("");

      const response = await checkHealth();

      setStatus(response.status);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">
          Car Dealership
        </h1>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Backend Connection
          </h2>

          <button
            onClick={handleHealthCheck}
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check Backend"}
          </button>

          {status && (
            <p className="mt-4 text-green-600">
              Backend status: {status}
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
