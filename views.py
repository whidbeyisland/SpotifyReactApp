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

from torchvision import models
from torchvision import transforms
from PIL import Image
from django.shortcuts import render
from django.conf import settings
#from fastbook import *
from torchtext.data import get_tokenizer
from fastai.text.all import *
#from pathlib import Path

nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')
from nltk.corpus import wordnet
from nltk import FreqDist
from string import punctuation
import datetime

from .forms import TextEntryForm
from .download_pkls import *
from .work_with_models import *
from .tweet_manipulations import *
from .likes_replies_generator import LikesRepliesGenerator

def index(request):
    # syn1 = wordnet.synsets('vaccine')
    # syn2 = wordnet.synsets('illness')
    # print(len(syn1))
    # print(len(syn2))
    # for i in range(0, len(syn1)):
    #     for j in range(0, len(syn2)):
    #         try:
    #             syn1_a = syn1[i]
    #             syn2_a = syn2[j]
    #             print(str(i) + "......" + str(j))
    #             print('wup: ' + str(syn1_a.wup_similarity(syn2_a)))
    #             print('path: ' + str(syn1_a.path_similarity(syn2_a)))
    #             print('lch: ' + str(syn1_a.lch_similarity(syn2_a)))
    #         except:
    #             pass
    
    # print(nltk.tag.pos_tag(['lgbtq']))
    # print(nltk.tag.pos_tag(['libdems']))
    # print(nltk.tag.pos_tag(['alamo']))
    # print(nltk.tag.pos_tag(['retweeted']))
    # print(nltk.tag.pos_tag(['misunderstood']))

    # t = TweetManipulations()
    # t.find_syns('irredeemable')
    # t.find_syns('hate')
    # t.find_syns('dude')
    # t.find_syns('kick')

    request_complete = False
    predicted_label = None
    today = datetime.now()
    todaydate = today.strftime("%I:%M %p · %B %d, %Y")
    user_alias = 'Username Alias'
    username = 'username'
    predicted_tweets = ['Tweet goes here', 'Tweet goes here']
    num_likes_replies = LikesRepliesGenerator().generate(2)
    num_likes_str_0, num_replies_str_0 = num_likes_replies[0][0], num_likes_replies[0][1]
    num_likes_str_1, num_replies_str_1 = num_likes_replies[1][0], num_likes_replies[1][1]

    if request.method == 'POST':
        form = TextEntryForm(request.POST, request.FILES)
        if form.is_valid():
            username = form.cleaned_data['username']
            prompt = form.cleaned_data['prompt']

            try:
                # initialize basic classes to call methods from
                d = DownloadPkls()
                t = TweetManipulations()
                w = WorkWithModels(d, t)

                # download the user's tweets
                w.download_user_tweets(username)
                w.get_user_assets_ready(username)

                # get the user's most distinctive words: words they have used at least 3x in tweets, which are not in
                # the N most common words of each part of speech, or in a corpus of words used in Simpsons episodes
                w.get_rare_words(username)
                # w.get_syns_rare_words(username)

                # the tweets will be generated based on 11 "subculture" models
                w.get_generation_assets_ready()

                # the user will be categorized into 3 of 11 subcultures, e.g. "tech-nerd", "sports", "astrology".
                # language models trained on Twitter users from *these subcultures* will be used in lieu of a model
                # trained on the chosen user specifically, to save time and for more diverse training data
                        # coati: find a way to make the categorization process faster, like train a smaller model.
                        # until then, just using first 3 subcultures as dummy variables
                # w.get_categorization_assets_ready()
                # subs_to_generate = w.categorize_user(username)
                w.subs_eachuser[username] = [0, 1, 2]

                # finally, generate tweets based on each of the 3 chosen subcultures
                predicted_tweets = w.get_tweet_predictions(username, prompt)

                # get other variables ready for the index.html homepage
                predicted_label = 'success!'
                user_alias = username # coati: retrieve person's alias
                request_complete = True

            except RuntimeError as re:
                predicted_label = re

    else:
        form = TextEntryForm()

    context = {
        'form': form,
        'predicted_tweets': predicted_tweets,
        'predicted_label': predicted_label,
        'username': username,
        'user_alias': user_alias,
        'todaydate': todaydate,
        'num_likes_str_0': num_likes_str_0,
        'num_replies_str_0': num_replies_str_0,
        'num_likes_str_1': num_likes_str_1,
        'num_replies_str_1': num_replies_str_1,
        'request_complete': request_complete
    }
    return render(request, 'parrot/index.html', context)
