const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

/**
 * Generate models.py for a Django app
 * @param {string} outputFolder - Project root
 * @param {string} projectName - Django project name
 * @param {string} appName - App name
 * @param {Object[]} models - Model definitions
 * @returns {string} Path to generated file
 */
function generateModels(outputFolder, projectName, appName, djangoModel) {
 
  const filePath = path.join(outputFolder, appName, "models.py");

  
  console.log(`📊 Generating models for app "${appName}" using schema generator...`);
  
  const ssoUserModel = [
    "",
    "from django.conf import settings",
    "from django.contrib.auth.models import AbstractUser",
    "",
    "",
    "class SSOUser(AbstractUser):",
    "    groups = models.ManyToManyField(",
    "        'auth.Group',",
    "        related_name='ssouser_set',",
    "        blank=True,",
    "        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',",
    "        verbose_name='groups',",
    "    )",
    "    user_permissions = models.ManyToManyField(",
    "        'auth.Permission',",
    "        related_name='ssouser_permissions_set',",
    "        blank=True,",
    "        help_text='Specific permissions for this user.',",
    "        verbose_name='user permissions',",
    "    )",
    "",
  ].join("\n");

  
    const content = djangoModel + "\n" + ssoUserModel;
    return writeFile(filePath, content);
  
}



function generateSkeletonModels(outputFolder, projectName, appName) {
  const filePath = path.join(outputFolder, appName, "models.py");

  
  console.log(`📊 Generating models for app "${appName}" using schema generator...`);
  
  const ssoUserModel = [
    "",
    "from django.conf import settings",
    "from django.contrib.auth.models import AbstractUser",
    "from django.db import models",
    "",
    "",
    "class SSOUser(AbstractUser):",
    "    groups = models.ManyToManyField(",
    "        'auth.Group',",
    "        related_name='ssouser_set',",
    "        blank=True,",
    "        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',",
    "        verbose_name='groups',",
    "    )",
    "    user_permissions = models.ManyToManyField(",
    "        'auth.Permission',",
    "        related_name='ssouser_permissions_set',",
    "        blank=True,",
    "        help_text='Specific permissions for this user.',",
    "        verbose_name='user permissions',",
    "    )",
    "",
  ].join("\n");

    const content = ssoUserModel;
    return writeFile(filePath, content);
}

module.exports = { generateModels, generateSkeletonModels };