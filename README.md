# NexCare AI 🏥

### AI-Powered Hospital Readmission Risk Prediction and Analysis

NexCare AI is a machine learning-based web application designed to estimate the risk of hospital readmission within 30 days. It combines an interactive frontend with a Python backend to demonstrate patient risk prediction, model evaluation, and healthcare data analysis.

This project is developed for educational and research purposes.

> **Disclaimer:** NexCare AI is an experimental academic project. Its predictions are not clinically validated and must not be used as the sole basis for medical decisions or patient care.

---

## 📌 Project Overview

Hospital readmissions can create additional costs and challenges for patients and healthcare providers. NexCare AI explores how machine learning can help analyze hospital encounter data and estimate the likelihood of readmission.

The application includes:
- Patient information and risk assessment interface
- Machine learning-based readmission predictions
- Model performance comparison
- Data quality analysis
- Fairness analysis
- Explainability and risk analysis interfaces
- FastAPI backend for serving predictions

---

## 🤖 Machine Learning Models

The project implements and compares three classification algorithms:

### 1. Logistic Regression
A statistical classification algorithm used to estimate the probability of readmission.

### 2. Decision Tree
A tree-based model that learns decision rules from the training data.

### 3. Random Forest
An ensemble learning algorithm that combines multiple decision trees to generate predictions.

### Model Evaluation

The models are evaluated using:
- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC
- Confusion matrix

Model performance depends on the dataset, preprocessing, train/test split, and classification threshold. Refer to the generated evaluation metrics for the measured results.

---

## 📊 Dataset

The project uses the **Diabetes 130-US Hospitals for Years 1999–2008** dataset from the UCI Machine Learning Repository.

Dataset source:

https://archive.ics.uci.edu/dataset/296/diabetes+130+us+hospitals+for+years+1999-2008

The dataset contains hospital encounter information for patients with diabetes.

The current training pipeline defines the positive class as:

`readmitted == "<30"`

This represents readmission within 30 days.

**Dataset note:** The dataset is not included in the public repository by default. Follow the dataset's access and usage terms before downloading or redistributing it.

---

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- TanStack Start
- Tailwind CSS
- Vite

### Backend
- Python
- FastAPI
- Uvicorn

### Machine Learning
- Scikit-learn
- Pandas
- NumPy
- Joblib

### Development Tools
- Git
- GitHub
- Visual Studio Code
- Node.js and npm

---

## 📁 Project Structure

```text
NexCare-AI/
│
├── backend/
│   ├── data/
│   │   └── diabetic_data.csv       # Local dataset; not committed
│   ├── models/
│   │   ├── logistic_regression.joblib
│   │   ├── decision_tree.joblib
│   │   └── random_forest.joblib
│   ├── main.py                     # FastAPI application
│   ├── train_model.py              # Model training script
│   ├── requirements.txt            # Python dependencies
│   └── metrics.json                # Model evaluation results
│
├── public/                         # Static assets
├── src/                            # Frontend source code
├── package.json                    # Frontend dependencies
├── package-lock.json
├── .gitignore
└── README.md
