import pandas as pd
import matplotlib.pyplot as plt
from io import StringIO

# Create a DataFrame directly from the provided CSV data as a string
csv_data = """
mapping,t_SYNC node @ 0 nsec (count: 0),t_REACTION node for reaction_4 of CompressFiles.d (count: 0),t_REACTION node for reaction_3 of CompressFiles.d (count: 0),t_REACTION node for reaction_1 of CompressFiles.c1 (count: 0),t_REACTION node for reaction_2 of CompressFiles.d (count: 0),t_REACTION node for reaction_1 of CompressFiles.c2 (count: 0),t_REACTION node for reaction_1 of CompressFiles.c3 (count: 0),t_SYNC node @ 1 nsec (count: 0),t_DUMMY node @ 1 nsec (count: 0),executionTime,dynamicEnergy
0,pe03_cluster_a7_exynos,pe03_cluster_a15_exynos,pe03_cluster_a7_exynos,pe01_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a7_exynos,pe02_cluster_a15_exynos,46572319.35116154,184366791.398746
1,pe00_cluster_a15_exynos,pe03_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a15_exynos,pe00_cluster_a15_exynos,pe02_cluster_a15_exynos,93142363.33749516,184366898.09053525
2,pe03_cluster_a15_exynos,pe03_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe03_cluster_a15_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,93142363.33833475,184366898.08931887
3,pe00_cluster_a7_exynos,pe00_cluster_a7_exynos,pe00_cluster_a7_exynos,pe01_cluster_a7_exynos,pe01_cluster_a15_exynos,pe02_cluster_a7_exynos,pe01_cluster_a15_exynos,pe00_cluster_a7_exynos,pe03_cluster_a7_exynos,194601168.47428206,186078604.62389675
4,pe02_cluster_a7_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,pe02_cluster_a7_exynos,pe02_cluster_a7_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe02_cluster_a7_exynos,pe01_cluster_a7_exynos,194601169.30031043,185222646.7641745
5,pe02_cluster_a15_exynos,pe01_cluster_a7_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,pe01_cluster_a7_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe01_cluster_a7_exynos,194601341.91999623,185222540.0322153
6,pe02_cluster_a15_exynos,pe02_cluster_a15_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,pe03_cluster_a7_exynos,pe03_cluster_a7_exynos,pe02_cluster_a15_exynos,194601341.93346545,185222731.9152039
"""
data = pd.read_csv(StringIO(csv_data))

# Extracting only the execution time and dynamic energy columns
execution_time = data['executionTime']
dynamic_energy = data['dynamicEnergy']

# Plotting the scatter plot
plt.figure(figsize=(10, 6))
plt.scatter(execution_time, dynamic_energy, color='blue', alpha=0.5)
plt.title('Execution Time vs Dynamic Energy')
plt.xlabel('Execution Time')
plt.ylabel('Dynamic Energy')
plt.grid(True)

# Setting axis limits
plt.xlim(min(execution_time) * 0.95, max(execution_time) * 1.05)
plt.ylim(min(dynamic_energy) * 0.99, max(dynamic_energy) * 1.01)

# Save the plot to a file
plot_filename = 'ExecutionTime_vs_DynamicEnergy.png'
plt.savefig(plot_filename)
plt.close()
