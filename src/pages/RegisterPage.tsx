import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Le nom d\'utilisateur doit comporter au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères')
    .matches(/^[a-zA-Z0-9_]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et _')
    .required('Nom d\'utilisateur requis'),
  email: Yup.string()
    .email('Adresse email invalide')
    .required('Email requis'),
  first_name: Yup.string()
    .required('Prénom requis'),
  last_name: Yup.string()
    .required('Nom requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre'
    )
    .required('Mot de passe requis'),
  password2: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Les mots de passe doivent correspondre')
    .required('Confirmer le mot de passe est requis'),
});

const RegisterPage: React.FC = () => {
  const { register, error: authError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Formes décoratives */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gray-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gray-200 rounded-full opacity-40 blur-3xl"></div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-3xl font-extrabold text-gray-900"
            >
              Créer un compte
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 text-sm text-gray-600"
            >
              Ou{' '}
              <Link to="/login" className="font-medium text-black hover:text-gray-800">
                connectez-vous à votre compte existant
              </Link>
            </motion.p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {authError}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Formik
              initialValues={{
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                password: '',
                password2: '',
              }}
              validationSchema={RegisterSchema}
              onSubmit={async (values) => {
                await register(values);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <div className="mt-1 relative">
                        <Field
                          id="first_name"
                          name="first_name"
                          type="text"
                          autoComplete="given-name"
                          className={`appearance-none block w-full px-3 py-2.5 border ${
                            errors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                          placeholder="Prénom"
                        />
                        <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <div className="mt-1 relative">
                        <Field
                          id="last_name"
                          name="last_name"
                          type="text"
                          autoComplete="family-name"
                          className={`appearance-none block w-full px-3 py-2.5 border ${
                            errors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                          placeholder="Nom"
                        />
                        <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Nom d'utilisateur
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        className={`appearance-none block w-full px-3 py-2.5 border ${
                          errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                        placeholder="Nom d'utilisateur"
                      />
                      <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`appearance-none block w-full px-3 py-2.5 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                        placeholder="Adresse email"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`appearance-none block w-full px-3 py-2.5 border ${
                          errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                        placeholder="Mot de passe"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <div className="mt-1 relative">
                      <Field
                        id="password2"
                        name="password2"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`appearance-none block w-full px-3 py-2.5 border ${
                          errors.password2 && touched.password2 ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black`}
                        placeholder="Confirmer le mot de passe"
                      />
                      <ErrorMessage name="password2" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                        loading || isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Inscription en cours...
                        </>
                      ) : (
                        'S\'inscrire'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <div className="flex justify-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-black flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;