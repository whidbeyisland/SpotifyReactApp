import base64
import io
import json
import os
import gdown
#import fastbook
#fastbook.setup_book()
import fastai
import pandas as pd
import requests
import torchtext
import nltk
import snscrape.modules.twitter as sntwitter
from copy import deepcopy

from torchvision import models
from torchvision import transforms
from PIL import Image
from django.shortcuts import render
from django.conf import settings
#from fastbook import *
from torchtext.data import get_tokenizer
from fastai.imports import *
from fastai.tabular.all import *
from fastai.tabular import *
from fastai.collab import *

import pathlib
posixpath_temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

import sys



cat_names = ['Pop', 'Rock', 'Country', 'Metal', 'Jazz', 'HipHop', 'JPop', 'Chiptune', 'Trance', 'House', 'R&B', 'KPop']
procs = [Categorify, FillMissing, Normalize]
path_cwd = os.getcwd()
path_df = 'pytorch_assets\\dataframes'
path_dls = 'pytorch_assets\\dataloaders'
path_models = 'pytorch_assets\\models'

class RunPredictionModels:
    liked_genres_str = None

    def __init__(self, _liked_genres_str):
        if _liked_genres_str == None or len(_liked_genres_str) != len(cat_names):
            self.liked_genres_str = self.rand_liked_genres_str()
        else:
            self.liked_genres_str = _liked_genres_str
        print(self.liked_genres_str)
        print('fed to me: ' + _liked_genres_str)

    def fileize(self, name):
        lower_name = name.lower()
        name_ltrs = re.sub('[^a-zA-Z]', '_', lower_name)
        return name_ltrs
    
    def rand_liked_genres_str(self):
        new_str = ''
        for i in range(0, len(cat_names)):
            new_str.append(str(random.randint(0, 1)))
        return new_str

    def initialize_assets(self):
        # mocked data right now for correlations between liking each genre and liking other genres
        df = pd.read_csv(os.path.join(path_df, 'mock_music_data_5.csv'))
        print(df.shape)

        # for each genre: create a list of all the *other* genres to predict whether or not the user will like
        cat_names_eachgenre = []
        for i in range(0, len(cat_names)):
            cat_names_thisgenre = deepcopy(cat_names)
            cat_names_thisgenre.remove(cat_names[i])
            cat_names_eachgenre.append(cat_names_thisgenre)

        print('Initializing data loaders...')
        dls_eachgenre = []
        try:
            for i in range(0, len(cat_names)):
                dls_thisgenre = torch.load(os.path.join(path_cwd, path_dls, 'dls-tab-0001-' + self.fileize(cat_names[i]) + '.pkl'))
                dls_eachgenre.append(dls_thisgenre)
        except Exception as e:
            print(e)
        
        print('Initializing models...')
        tab_learn_eachgenre = []
        try:
            for i in range(0, len(cat_names)):
                tab_learn_thisgenre = tabular_learner(dls_eachgenre[i], metrics=accuracy)
                tab_learn_thisgenre.path = Path(str(path_cwd))/'pytorch_assets'
                tab_learn_thisgenre.load('learn-tab-0001-' + self.fileize(cat_names[i]))
                tab_learn_eachgenre.append(tab_learn_thisgenre)
        except Exception as e:
            print(e)
        
        # for each genre, get the likelihood of the user liking that genre
        print('Making predictions from your liked genres...')
        user_appeal_dict = dict()
        for i in range(0, len(cat_names)):
            row_dict = dict()
            for j in range(0, len(cat_names)):
                float_thisgenre = float(self.liked_genres_str[j])
                row_dict[cat_names[j]] = [float_thisgenre]
            row = pd.DataFrame(row_dict)
            row = tab_learn_eachgenre[i].dls.test_dl(row)
            
            try:
                # print(type(tab_learn_eachgenre[5])) # TabularLearner
                # preds = tab_learn_eachgenre[5].predict(row)[0]
                preds = tab_learn_eachgenre[i].get_preds(dl=row)[0]
                # print(preds)
                # print(np.argmax(preds))

                # adding to user_appeal_dict the chance that the user likes the genre at index i
                user_appeal_dict[cat_names[i]] = preds[0][1]
            except Exception as e:
                print(e)
        
        # print all likelihoods in *ascending* order --- least liked genres at top
        print('Genres you are least likely to like...')
        user_appeal_list = []
        for i in range(0, len(cat_names)):
            user_appeal_list.append([cat_names[i], user_appeal_dict[cat_names[i]]])
        user_appeal_list.sort(key=lambda x: x[1])
        for i in range(0, len(user_appeal_list)):
            print(user_appeal_list[i][0] + ' (likelihood: ' + str(int(100 * user_appeal_list[i][1])) + '%)')
